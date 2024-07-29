package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.controller.payload.RejectApplicationPayload;
import thesistrack.ls1.dto.ApplicationDto;
import thesistrack.ls1.dto.PageResponse;
import thesistrack.ls1.entity.Application;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.ApplicationService;
import thesistrack.ls1.service.AuthenticationService;

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
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<PageResponse<ApplicationDto>> getApplications(
            @RequestParam(required = false) ApplicationState[] states,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer limit,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) {
        Page<Application> applications = applicationService.getAll(searchQuery, states, page, limit, sortBy, sortOrder);

        return ResponseEntity.ok(new PageResponse<>(applications.map(ApplicationDto::fromApplicationEntity)));
    }

    @PutMapping("/{applicationId}/accept")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<ApplicationDto> acceptApplication(@PathVariable String applicationId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<ApplicationDto> rejectApplication(
            @PathVariable UUID applicationId,
            @RequestBody RejectApplicationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = this.authenticationService.getAuthenticatedUser(jwt);
        Application application =  applicationService.reject(
                applicationId,
                authenticatedUser,
                payload.getComment(),
                payload.getNotifyUser()
        );

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application));
    }
}
