package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.constants.StringLimits;
import thesistrack.ls1.constants.ThesisCommentType;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.controller.payload.*;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.ThesisCommentDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisComment;
import thesistrack.ls1.entity.ThesisPresentation;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.ThesisCommentService;
import thesistrack.ls1.service.ThesisService;
import thesistrack.ls1.utility.RequestValidator;

import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/theses")
public class ThesisController {
    private final ThesisService thesisService;
    private final AuthenticationService authenticationService;
    private final ThesisCommentService thesisCommentService;

    @Autowired
    public ThesisController(ThesisService thesisService, AuthenticationService authenticationService, ThesisCommentService thesisCommentService) {
        this.thesisService = thesisService;
        this.authenticationService = authenticationService;
        this.thesisCommentService = thesisCommentService;
    }

    @GetMapping
    public ResponseEntity<PaginationDto<ThesisDto>> getTheses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ThesisState[] state,
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
            if (authenticatedUser.hasAnyGroup("admin")) {
                userId = null;
                visibilities = null;
            } else if (authenticatedUser.hasAnyGroup("advisor", "supervisor")) {
                userId = null;
                visibilities = Set.of(ThesisVisibility.PUBLIC, ThesisVisibility.STUDENT, ThesisVisibility.INTERNAL);
            } else if (authenticatedUser.hasAnyGroup("student")) {
                userId = null;
                visibilities = Set.of(ThesisVisibility.PUBLIC, ThesisVisibility.STUDENT);
            }
        }

        Page<Thesis> theses = thesisService.getAll(
                userId,
                visibilities,
                search,
                state,
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(
                theses.map(thesis -> ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)))
        ));
    }

    @GetMapping("/{thesisId}")
    public ResponseEntity<ThesisDto> getThesis(@PathVariable UUID thesisId, JwtAuthenticationToken jwt) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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
                null
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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
                RequestValidator.validateStringMaxLength(payload.abstractText(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.infoText(), StringLimits.LONGTEXT.getLimit())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    /* PROPOSAL ENDPOINTS */

    @GetMapping("/{thesisId}/proposal")
    public ResponseEntity<Resource> getProposalFile(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=proposal_%s.pdf", thesisId))
                .body(thesisService.getProposalFile(thesis));
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

        thesis = thesisService.uploadProposal(authenticatedUser, thesis, RequestValidator.validateNotNull(proposalFile));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    @GetMapping("/{thesisId}/presentation")
    public ResponseEntity<Resource> getPresentationFile(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=presentation_%s.pdf", thesisId))
                .body(thesisService.getPresentationFile(thesis));
    }

    @PutMapping("/{thesisId}/presentation")
    public ResponseEntity<ThesisDto> uploadPresentation(
            @PathVariable UUID thesisId,
            @RequestPart("presentation") MultipartFile presentationFile,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to upload a presentation");
        }

        thesis = thesisService.uploadPresentation(thesis, RequestValidator.validateNotNull(presentationFile));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    @GetMapping("/{thesisId}/thesis")
    public ResponseEntity<Resource> getThesisFile(
            @PathVariable UUID thesisId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=thesis_%s.pdf", thesisId))
                .body(thesisService.getThesisFile(thesis));
    }

    @PutMapping("/{thesisId}/thesis")
    public ResponseEntity<ThesisDto> uploadThesis(
            @PathVariable UUID thesisId,
            @RequestPart("thesis") MultipartFile thesisFile,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a student of this thesis to upload a thesis");
        }

        thesis = thesisService.uploadThesis(thesis, RequestValidator.validateNotNull(thesisFile));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/presentations")
    public ResponseEntity<ThesisDto> createPresentation(
            @PathVariable UUID thesisId,
            @RequestBody CreatePresentationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be a advisor of this thesis to perform this action");
        }

        thesis = thesisService.createPresentation(
                authenticatedUser,
                thesis,
                RequestValidator.validateNotNull(payload.type()),
                RequestValidator.validateNotNull(payload.visibility()),
                RequestValidator.validateStringMaxLength(payload.location(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.streamUrl(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.date())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    @DeleteMapping("/{thesisId}/presentations/{presentationId}")
    public ResponseEntity<ThesisDto> deletePresentation(
            @PathVariable UUID thesisId,
            @PathVariable UUID presentationId,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        ThesisPresentation presentation = thesisService.findPresentationById(thesisId, presentationId);

        if (!presentation.hasManagementAccess(authenticatedUser)) {
            throw new AccessDeniedException("You are not allowed to delete this presentation");
        }

        Thesis thesis = thesisService.deletePresentation(authenticatedUser, presentation);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("inline; filename=comment_%s.pdf", commentId))
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
                RequestValidator.validateStringMaxLength(payload.summary(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.positives(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.negatives(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.gradeSuggestion(), StringLimits.THESIS_GRADE.getLimit())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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
                RequestValidator.validateStringMaxLength(payload.finalFeedback(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.visibility())
        );

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
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

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }
}
