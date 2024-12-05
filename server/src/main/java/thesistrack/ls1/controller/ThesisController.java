package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.*;
import thesistrack.ls1.controller.payload.*;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.ThesisCommentDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.ThesisCommentService;
import thesistrack.ls1.service.ThesisPresentationService;
import thesistrack.ls1.service.ThesisService;
import thesistrack.ls1.utility.RequestValidator;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/v2/theses")
public class ThesisController {
    private final ThesisService thesisService;
    private final AuthenticationService authenticationService;
    private final ThesisCommentService thesisCommentService;
    private final ThesisPresentationService thesisPresentationService;

    @Autowired
    public ThesisController(ThesisService thesisService, AuthenticationService authenticationService, ThesisCommentService thesisCommentService, ThesisPresentationService thesisPresentationService) {
        this.thesisService = thesisService;
        this.authenticationService = authenticationService;
        this.thesisCommentService = thesisCommentService;
        this.thesisPresentationService = thesisPresentationService;
    }

    @GetMapping
    public ResponseEntity<PaginationDto<ThesisDto>> getTheses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ThesisState[] state,
            @RequestParam(required = false) String[] type,
            @RequestParam(required = false, defaultValue = "false") Boolean fetchAll,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);

        UUID userId = authenticatedUser.getId();
        Set<ThesisVisibility> visibilities = Set.of(
                ThesisVisibility.PUBLIC,
                ThesisVisibility.STUDENT,
                ThesisVisibility.INTERNAL,
                ThesisVisibility.PRIVATE
        );

        if (fetchAll) {
            userId = null;

            if (authenticatedUser.hasAnyGroup("admin")) {
                visibilities = null;
            } else if (authenticatedUser.hasAnyGroup("advisor", "supervisor")) {
                visibilities = Set.of(ThesisVisibility.PUBLIC, ThesisVisibility.STUDENT, ThesisVisibility.INTERNAL);
            } else if (authenticatedUser.hasAnyGroup("student")) {
                visibilities = Set.of(ThesisVisibility.PUBLIC, ThesisVisibility.STUDENT);
            } else {
                visibilities = Set.of(ThesisVisibility.PUBLIC);
            }
        }

        Page<Thesis> theses = thesisService.getAll(
                userId,
                visibilities,
                search,
                state,
                type,
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(
                theses.map(thesis -> ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)))
        ));
    }

    @GetMapping("/{thesisId}")
    public ResponseEntity<ThesisDto> getThesis(@PathVariable UUID thesisId, JwtAuthenticationToken jwt) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<ThesisDto> createThesis(
            @RequestBody CreateThesisPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.createThesis(
                authenticatedUser,
                RequestValidator.validateStringMaxLength(payload.thesisTitle(), StringLimits.THESIS_TITLE.getLimit()),
                RequestValidator.validateStringMaxLength(payload.thesisType(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.supervisorIds()),
                RequestValidator.validateNotNull(payload.advisorIds()),
                RequestValidator.validateNotNull(payload.studentIds()),
                null,
                true
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PutMapping("/{thesisId}")
    public ResponseEntity<ThesisDto> updateThesisConfig(
            @PathVariable UUID thesisId,
            @RequestBody UpdateThesisPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to update the thesis");
        }

        thesis = thesisService.updateThesis(
                authenticatedUser,
                thesis,
                RequestValidator.validateStringMaxLength(payload.thesisTitle(), StringLimits.THESIS_TITLE.getLimit()),
                RequestValidator.validateStringMaxLength(payload.thesisType(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.visibility()),
                RequestValidator.validateNotNull(payload.keywords()),
                payload.startDate(),
                payload.endDate(),
                RequestValidator.validateNotNull(payload.studentIds()),
                RequestValidator.validateNotNull(payload.advisorIds()),
                RequestValidator.validateNotNull(payload.supervisorIds()),
                RequestValidator.validateNotNull(payload.states())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @DeleteMapping("/{thesisId}")
    public ResponseEntity<ThesisDto> closeThesis(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        thesis = thesisService.closeThesis(authenticatedUser, thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PutMapping("/{thesisId}/info")
    public ResponseEntity<ThesisDto> updateThesisInfo(
            @PathVariable UUID thesisId,
            @RequestBody UpdateThesisInfoPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to update the abstract and info");
        }

        thesis = thesisService.updateThesisInfo(
                thesis,
                RequestValidator.validateStringMaxLength(payload.abstractText(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.infoText(), StringLimits.UNLIMITED_TEXT.getLimit())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    /* FEEDBACK ENDPOINTS */
    @PutMapping("/{thesisId}/feedback/{feedbackId}/{action}")
    public ResponseEntity<ThesisDto> completeFeedback(
            @PathVariable UUID thesisId,
            @PathVariable UUID feedbackId,
            @PathVariable String action,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to complete a feedback item");
        }

        thesis = thesisService.completeFeedback(thesis, feedbackId, action.equals("complete"));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @DeleteMapping("/{thesisId}/feedback/{feedbackId}")
    public ResponseEntity<ThesisDto> deleteFeedback(
            @PathVariable UUID thesisId,
            @PathVariable UUID feedbackId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a advisor of this thesis to delete a feedback item");
        }

        thesis = thesisService.deleteFeedback(thesis, feedbackId);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/feedback")
    public ResponseEntity<ThesisDto> requestChanges(
            @PathVariable UUID thesisId,
            @RequestBody RequestChangesPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to request changes");
        }

        thesis = thesisService.requestChanges(
                authenticatedUser,
                thesis,
                RequestValidator.validateNotNull(payload.type()),
                RequestValidator.validateNotNull(payload.requestedChanges())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    /* PROPOSAL ENDPOINTS */

    @GetMapping("/{thesisId}/proposal/{proposalId}")
    public ResponseEntity<Resource> getProposalFile(
            @PathVariable UUID thesisId,
            @PathVariable UUID proposalId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        ThesisProposal proposal = thesis.getProposalById(proposalId).orElseThrow();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=proposal_%s.pdf", thesisId))
                .body(thesisService.getProposalFile(proposal));
    }

    @DeleteMapping("/{thesisId}/proposal/{proposalId}")
    public ResponseEntity<ThesisDto> deleteProposal(
            @PathVariable UUID thesisId,
            @PathVariable UUID proposalId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to delete this proposal");
        }

        thesis = thesisService.deleteProposal(thesis, proposalId);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/proposal")
    public ResponseEntity<ThesisDto> uploadProposal(
            @PathVariable UUID thesisId,
            @RequestPart("proposal") MultipartFile proposalFile,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to add a proposal");
        }

        if (thesis.getState() != ThesisState.PROPOSAL && !thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("Only advisors can upload a new proposal if thesis state is not PROPOSAL");
        }

        thesis = thesisService.uploadProposal(authenticatedUser, thesis, RequestValidator.validateNotNull(proposalFile));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PutMapping("/{thesisId}/proposal/accept")
    public ResponseEntity<ThesisDto> acceptProposal(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to accept a proposal");
        }

        thesis = thesisService.acceptProposal(authenticatedUser, thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    /* WRITING ENDPOINTS */

    @PutMapping("/{thesisId}/thesis/final-submission")
    public ResponseEntity<ThesisDto> submitThesis(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of the thesis to do the final submission");
        }

        thesis = thesisService.submitThesis(thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/files")
    public ResponseEntity<ThesisDto> uploadThesisFile(
            @PathVariable UUID thesisId,
            @RequestPart("type") String type,
            @RequestPart("file") MultipartFile file,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to upload thesis files");
        }

        if (thesis.getState() != ThesisState.WRITING && !thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("Only advisors can upload a new file if thesis state is not WRITING");
        }

        thesis = thesisService.uploadThesisFile(authenticatedUser, thesis, type, RequestValidator.validateNotNull(file));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @GetMapping("/{thesisId}/files/{fileId}")
    public ResponseEntity<Resource> getThesisFile(
            @PathVariable UUID thesisId,
            @PathVariable UUID fileId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        ThesisFile file = thesis.getFileById(fileId).orElseThrow();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=" + file.getFilename(), thesisId))
                .body(thesisService.getThesisFile(file));
    }

    @DeleteMapping("/{thesisId}/files/{fileId}")
    public ResponseEntity<ThesisDto> deleteThesisFile(
            @PathVariable UUID thesisId,
            @PathVariable UUID fileId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to delete this file");
        }

        thesis = thesisService.deleteThesisFile(thesis, fileId);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/presentations")
    public ResponseEntity<ThesisDto> createPresentation(
            @PathVariable UUID thesisId,
            @RequestBody ReplacePresentationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to create a presentation");
        }

        thesis = thesisPresentationService.createPresentation(
                authenticatedUser,
                thesis,
                RequestValidator.validateNotNull(payload.type()),
                RequestValidator.validateNotNull(payload.visibility()),
                RequestValidator.validateStringMaxLength(payload.location(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.streamUrl(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.language(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.date())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PutMapping("/{thesisId}/presentations/{presentationId}")
    public ResponseEntity<ThesisDto> updatePresentation(
            @PathVariable UUID thesisId,
            @PathVariable UUID presentationId,
            @RequestBody ReplacePresentationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        ThesisPresentation presentation = thesisPresentationService.findById(thesisId, presentationId);
        Thesis thesis = presentation.getThesis();

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to update a presentation");
        }

        if (presentation.getState() == ThesisPresentationState.SCHEDULED && !thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to update a scheduled presentation");
        }

        thesis = thesisPresentationService.updatePresentation(
                presentation,
                RequestValidator.validateNotNull(payload.type()),
                RequestValidator.validateNotNull(payload.visibility()),
                RequestValidator.validateStringMaxLength(payload.location(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.streamUrl(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.language(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.date())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/presentations/{presentationId}/schedule")
    public ResponseEntity<ThesisDto> schedulePresentation(
            @PathVariable UUID thesisId,
            @PathVariable UUID presentationId,
            @RequestBody SchedulePresentationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        ThesisPresentation presentation = thesisPresentationService.findById(thesisId, presentationId);
        Thesis thesis = presentation.getThesis();

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to schedule a presentation");
        }

        thesis = thesisPresentationService.schedulePresentation(
                presentation,
                RequestValidator.validateNotNull(payload.inviteChairMembers()),
                RequestValidator.validateNotNull(payload.inviteThesisStudents()),
                RequestValidator.validateNotNull(payload.optionalAttendees())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @DeleteMapping("/{thesisId}/presentations/{presentationId}")
    public ResponseEntity<ThesisDto> deletePresentation(
            @PathVariable UUID thesisId,
            @PathVariable UUID presentationId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        ThesisPresentation presentation = thesisPresentationService.findById(thesisId, presentationId);

        if (!presentation.hasManagementAccess(authenticatedUser)) {
            throw new AccessDeniedException("You are not allowed to delete this presentation");
        }

        Thesis thesis = thesisPresentationService.deletePresentation(authenticatedUser, presentation);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @GetMapping("/{thesisId}/comments")
    public ResponseEntity<PaginationDto<ThesisCommentDto>> getComments(
            @PathVariable UUID thesisId,
            @RequestParam(required = false, defaultValue = "THESIS") ThesisCommentType commentType,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (commentType == ThesisCommentType.ADVISOR && !thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to view advisor comments");
        }

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view comments on this thesis");
        }

        Page<ThesisComment> comments = thesisCommentService.getComments(thesis, commentType, page, limit);

        return ResponseEntity.ok(PaginationDto.fromSpringPage(comments.map(ThesisCommentDto::fromCommentEntity)));
    }

    @PostMapping("/{thesisId}/comments")
    public ResponseEntity<ThesisCommentDto> createComment(
            @PathVariable UUID thesisId,
            @RequestPart("data") PostThesisCommentPayload payload,
            @RequestPart(value = "file", required = false) MultipartFile file,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (payload.commentType() == ThesisCommentType.ADVISOR && !thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be an advisor of this thesis to add an advisor comment");
        }

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to add a comment");
        }

        ThesisComment comment = thesisCommentService.postComment(
                authenticatedUser,
                thesis,
                RequestValidator.validateNotNull(payload.commentType()),
                RequestValidator.validateStringMaxLength(payload.message(), StringLimits.LONGTEXT.getLimit()),
                file
        );

        return ResponseEntity.ok(ThesisCommentDto.fromCommentEntity(comment));
    }

    @GetMapping("/{thesisId}/comments/{commentId}/file")
    public ResponseEntity<Resource> getCommentFile(
            @PathVariable UUID thesisId,
            @PathVariable UUID commentId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        ThesisComment comment = thesisCommentService.findById(thesisId, commentId);

        if (comment.getType() == ThesisCommentType.ADVISOR && !comment.getThesis().hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a advisor of this thesis to view an advisor file");
        }

        if (!comment.getThesis().hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this comment");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=" + comment.getFilename(), commentId))
                .body(thesisCommentService.getCommentFile(comment));
    }

    @DeleteMapping("/{thesisId}/comments/{commentId}")
    public ResponseEntity<ThesisCommentDto> deleteComment(
            @PathVariable UUID thesisId,
            @PathVariable UUID commentId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        ThesisComment comment = thesisCommentService.findById(thesisId, commentId);

        if (!comment.hasManagementAccess(authenticatedUser)) {
            throw new AccessDeniedException("You are not allowed to delete this comment");
        }

        comment = thesisCommentService.deleteComment(comment);

        return ResponseEntity.ok(ThesisCommentDto.fromCommentEntity(comment));
    }

    /* ASSESSMENT ENDPOINTS */

    @GetMapping("/{thesisId}/assessment")
    public ResponseEntity<Resource> getAssessmentFile(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a advisor of this thesis to add an assessment");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=assessment.pdf")
                .body(thesisService.getAssessmentFile(thesis));
    }

    @PostMapping("/{thesisId}/assessment")
    public ResponseEntity<ThesisDto> createAssessment(
            @PathVariable UUID thesisId,
            @RequestBody CreateAssessmentPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a advisor of this thesis to add an assessment");
        }

        thesis = thesisService.submitAssessment(
                authenticatedUser,
                thesis,
                RequestValidator.validateStringMaxLength(payload.summary(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.positives(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.negatives(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.gradeSuggestion(), StringLimits.THESIS_GRADE.getLimit())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    /* GRADE ENDPOINTS */

    @PostMapping("/{thesisId}/grade")
    public ResponseEntity<ThesisDto> addGrade(
            @PathVariable UUID thesisId,
            @RequestBody AddThesisGradePayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasSupervisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a supervisor of this thesis to add a final grade");
        }

        thesis = thesisService.gradeThesis(
                thesis,
                RequestValidator.validateStringMaxLength(payload.finalGrade(), StringLimits.THESIS_GRADE.getLimit()),
                RequestValidator.validateStringMaxLength(payload.finalFeedback(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateNotNull(payload.visibility())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/complete")
    public ResponseEntity<ThesisDto> completeThesis(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasSupervisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a supervisor of this thesis to close the thesis");
        }

        thesis = thesisService.completeThesis(thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser), thesis.hasStudentAccess(authenticatedUser)));
    }
}
