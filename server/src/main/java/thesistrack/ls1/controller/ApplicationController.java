package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.constants.StringLimits;
import thesistrack.ls1.controller.payload.AcceptApplicationPayload;
import thesistrack.ls1.controller.payload.RejectApplicationPayload;
import thesistrack.ls1.controller.payload.UpdateApplicationCommentPayload;
import thesistrack.ls1.dto.ApplicationDto;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.entity.Application;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.ApplicationService;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.utility.RequestValidator;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/applications")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final AuthenticationService authenticationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService, AuthenticationService authenticationService) {
        this.applicationService = applicationService;
        this.authenticationService = authenticationService;
    }

    @RequestMapping(method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationDto> createApplication() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping
    public ResponseEntity<PaginationDto<ApplicationDto>> getApplications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ApplicationState[] state,
            @RequestParam(required = false, defaultValue = "false") Boolean fetchAll,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);

        Page<Application> applications = applicationService.getAll(
                fetchAll && authenticatedUser.hasAnyGroup("admin", "supervisor", "advisor") ? null : authenticatedUser.getId(),
                search,
                state,
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(
                applications.map(application -> ApplicationDto.fromApplicationEntity(application, application.hasManagementAccess(authenticatedUser)))
        ));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationDto> getApplication(@PathVariable UUID applicationId, JwtAuthenticationToken jwt) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Application application = applicationService.findById(applicationId);

        if (!application.hasAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have access to this application");
        }

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application, application.hasManagementAccess(authenticatedUser)));
    }

    @PutMapping("/{applicationId}/comment")
    public ResponseEntity<ApplicationDto> updateComment(
            @PathVariable UUID applicationId,
            @RequestBody UpdateApplicationCommentPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = this.authenticationService.getAuthenticatedUser(jwt);
        Application application = applicationService.findById(applicationId);

        if (!application.hasManagementAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have access to this application");
        }

        application =  applicationService.updateComment(
                application,
                RequestValidator.validateStringMaxLength(payload.comment(), StringLimits.LONGTEXT.getLimit())
        );

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application, application.hasManagementAccess(authenticatedUser)));
    }

    @PutMapping("/{applicationId}/accept")
    public ResponseEntity<ApplicationDto> acceptApplication(
            @PathVariable UUID applicationId,
            @RequestBody AcceptApplicationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = this.authenticationService.getAuthenticatedUser(jwt);
        Application application = applicationService.findById(applicationId);

        if (!application.hasManagementAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have access to this application");
        }

        application = applicationService.accept(
                authenticatedUser,
                application,
                RequestValidator.validateStringMaxLength(payload.thesisTitle(), StringLimits.THESIS_TITLE.getLimit()),
                RequestValidator.validateStringMaxLength(payload.thesisType(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.advisorIds()),
                RequestValidator.validateNotNull(payload.supervisorIds()),
                RequestValidator.validateStringMaxLength(payload.comment(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.notifyUser()),
                RequestValidator.validateNotNull(payload.closeTopic())
        );

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application, application.hasManagementAccess(authenticatedUser)));
    }

    @PutMapping("/{applicationId}/reject")
    public ResponseEntity<ApplicationDto> rejectApplication(
            @PathVariable UUID applicationId,
            @RequestBody RejectApplicationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = this.authenticationService.getAuthenticatedUser(jwt);
        Application application = applicationService.findById(applicationId);

        if (!application.hasManagementAccess(authenticatedUser)) {
            throw new AccessDeniedException("You do not have access to this application");
        }

        application =  applicationService.reject(
                authenticatedUser,
                application,
                RequestValidator.validateStringMaxLength(payload.comment(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.notifyUser())
        );

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application, application.hasManagementAccess(authenticatedUser)));
    }
}
