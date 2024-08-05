package thesistrack.ls1.controller;

import com.nimbusds.jose.util.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.controller.payload.CreateThesisPayload;
import thesistrack.ls1.controller.payload.UpdateThesisInfoPayload;
import thesistrack.ls1.controller.payload.UpdateThesisPayload;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.ThesisService;

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

        Page<Thesis> theses = thesisService.getAll(
                fetchAll && authenticatedUser.hasAnyGroup("admin") ? null : authenticatedUser.getId(),
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
            throw new AccessDeniedException("You do not have access to this thesis");
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
            throw new AccessDeniedException("You do not have access to this thesis");
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
            throw new AccessDeniedException("You do not have access to this thesis");
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
            throw new AccessDeniedException("You do not have access to this thesis");
        }

        thesis = thesisService.updateThesisInfo(thesis, payload.abstractText(), payload.infoText());

        return ResponseEntity.ok(ThesisDto.fromThesisEntity(thesis, thesis.hasAdvisorAccess(authenticatedUser)));
    }

    /* PROPOSAL ENDPOINTS */

    @GetMapping("/{thesisId}/proposal")
    public ResponseEntity<Resource> getProposalFile(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/proposal")
    public ResponseEntity<ThesisDto> uploadProposal(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/proposal/accept")
    public ResponseEntity<ThesisDto> acceptProposal(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    /* WRITING ENDPOINTS */

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
    public ResponseEntity<ThesisDto> createAssessment(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    /* GRADE ENDPOINTS */

    @PostMapping("/{thesisId}/grade")
    public ResponseEntity<ThesisDto> addGrade(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/complete")
    public ResponseEntity<ThesisDto> completeThesis(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }
}
