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
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.controller.payload.*;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.ThesisCommentDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
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

    @Autowired
    public ThesisController(ThesisService thesisService, AuthenticationService authenticationService) {
        this.thesisService = thesisService;
        this.authenticationService = authenticationService;
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
                ThesisVisibility.INTERNAL,
                ThesisVisibility.PRIVATE
        );

        if (fetchAll) {
            if (authenticatedUser.hasAnyGroup("admin")) {
                userId = null;
                visibilities = null;
            } else if (authenticatedUser.hasAnyGroup("advisor", "supervisor")) {
                userId = null;
                visibilities = Set.of(ThesisVisibility.PUBLIC, ThesisVisibility.INTERNAL);
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
                RequestValidator.validateStringMaxLength(payload.thesisType(), StringLimits.THESIS_TYPE.getLimit()),
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
            throw new AccessDeniedException("You need to be a advisor of this thesis to perform this action");
        }

        thesis = thesisService.updateThesis(
                authenticatedUser,
                thesis,
                RequestValidator.validateStringMaxLength(payload.thesisTitle(), StringLimits.THESIS_TITLE.getLimit()),
                RequestValidator.validateStringMaxLength(payload.thesisType(), StringLimits.THESIS_TYPE.getLimit()),
                RequestValidator.validateNotNull(payload.visibility()),
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

        thesis = thesisService.closeThesis(thesis);

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
            throw new AccessDeniedException("You need to be a student of this thesis to perform this action");
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
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=proposal_%s.pdf", thesisId))
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
            throw new AccessDeniedException("You need to be a student of this thesis to perform this action");
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
            throw new AccessDeniedException("You need to be a advisor of this thesis to perform this action");
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

        if (!thesis.hasAdvisorAccess(authenticatedUser)) {
            throw new AccessDeniedException("You need to be advisor to perform this action");
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
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=presentation_%s.pdf", thesisId))
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
            throw new AccessDeniedException("You need to be a student of this thesis to perform this action");
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
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=thesis_%s.pdf", thesisId))
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
            throw new AccessDeniedException("You need to be a student of this thesis to perform this action");
        }

        thesis = thesisService.uploadThesis(thesis, RequestValidator.validateNotNull(thesisFile));

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    @PostMapping("/{thesisId}/presentations")
    public ResponseEntity<ThesisDto> createPresentation(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @DeleteMapping("/{thesisId}/presentations/{presentationId}")
    public ResponseEntity<ThesisDto> deletePresentation(@PathVariable UUID thesisId, @PathVariable UUID presentationId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/comments")
    public ResponseEntity<PaginationDto<ThesisCommentDto>> getComments(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/comments")
    public ResponseEntity<ThesisCommentDto> createComment(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/comments/{commentId}")
    public ResponseEntity<Resource> getCommentFile(@PathVariable UUID thesisId, @PathVariable UUID commentId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @DeleteMapping("/{thesisId}/comments/{commentId}")
    public ResponseEntity<ThesisCommentDto> deleteComment(@PathVariable UUID thesisId, @PathVariable UUID commentId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
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
            throw new AccessDeniedException("You need to be a advisor of this thesis to perform this action");
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
            throw new AccessDeniedException("You need to be a supervisor of this thesis to perform this action");
        }

        thesis = thesisService.gradeThesis(
                thesis,
                RequestValidator.validateStringMaxLength(payload.finalGrade(), StringLimits.THESIS_GRADE.getLimit()),
                RequestValidator.validateStringMaxLength(payload.finalFeedback(), StringLimits.LONGTEXT.getLimit())
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
            throw new AccessDeniedException("You need to be a supervisor of this thesis to perform this action");
        }

        thesis = thesisService.completeThesis(thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }
}
