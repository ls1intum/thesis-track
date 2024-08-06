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
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.controller.payload.*;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.ThesisService;

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
            @RequestParam(required = false, defaultValue = "20") Integer limit,
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
            } else if (authenticatedUser.hasAnyGroup("student", "advisor", "supervisor")) {
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

        if (!thesis.hasAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
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
                payload.thesisTitle(),
                payload.supervisorIds(),
                payload.advisorIds(),
                payload.studentIds(),
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.updateThesis(
                authenticatedUser,
                thesis,
                payload.thesisTitle(),
                payload.visibility(),
                payload.startDate(),
                payload.endDate(),
                payload.studentIds(),
                payload.advisorIds(),
                payload.supervisorIds(),
                payload.states()
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.updateThesisInfo(thesis, payload.abstractText(), payload.infoText());

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

        if (!thesis.hasAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=proposal_%s.pdf", thesisId))
                .body(thesisService.getProposalFile(thesis));
    }

    @PostMapping("/{thesisId}/proposal")
    public ResponseEntity<ThesisDto> uploadProposal(
            @PathVariable UUID thesisId,
            @RequestPart("proposal") MultipartFile proposal,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasStudentAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.uploadProposal(authenticatedUser, thesis, proposal);

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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.submitThesis(thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    @GetMapping("/{thesisId}/presentation")
    public ResponseEntity<Resource> getLastPresentationUpload(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/presentation")
    public ResponseEntity<ThesisDto> uploadPresentation(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/thesis")
    public ResponseEntity<Resource> getThesisFile(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/thesis")
    public ResponseEntity<ThesisDto> uploadThesis(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
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
    public ResponseEntity<Page<ThesisDto>> getComments(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/comments")
    public ResponseEntity<ThesisDto> createComment(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/comments/{fileId}")
    public ResponseEntity<ThesisDto> getCommentFile(@PathVariable UUID thesisId, @PathVariable String fileId) {
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.submitAssessment(
                authenticatedUser,
                thesis,
                payload.summary(),
                payload.positives(),
                payload.negatives(),
                payload.gradeSuggestion()
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.gradeThesis(
                thesis,
                payload.finalGrade(),
                payload.finalFeedback()
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
            throw new AccessDeniedException("You do not have the required permissions for this thesis");
        }

        thesis = thesisService.completeThesis(thesis);

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }
}
