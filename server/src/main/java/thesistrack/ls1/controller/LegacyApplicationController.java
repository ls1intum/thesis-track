package thesistrack.ls1.controller;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.controller.payload.LegacyAcceptApplicationPayload;
import thesistrack.ls1.controller.payload.LegacyCreateApplicationPayload;
import thesistrack.ls1.dto.ApplicationDto;
import thesistrack.ls1.entity.Application;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.ApplicationService;
import thesistrack.ls1.service.AuthenticationService;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/applications")
public class LegacyApplicationController {
    private final Bucket bucket;
    private final ApplicationService applicationService;
    private final AuthenticationService authenticationService;

    @Autowired
    public LegacyApplicationController(ApplicationService applicationService, AuthenticationService authenticationService) {
        this.applicationService = applicationService;
        this.authenticationService = authenticationService;

        Bandwidth limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));
        this.bucket = Bucket.builder().addLimit(limit).build();
    }

    @RequestMapping(method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationDto> createApplication(
            @RequestPart("thesisApplication") LegacyCreateApplicationPayload applicationPayload,
            @RequestPart("examinationReport") MultipartFile examinationReport,
            @RequestPart("cv") MultipartFile cv,
            @RequestPart(value = "degreeReport", required = false) MultipartFile degreeReport
    ) {
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        final Application application = applicationService
                .createLegacyApplication(applicationPayload, examinationReport, cv, degreeReport);

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application));
    }

    @PutMapping("/{applicationId}/accept")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<ApplicationDto> acceptApplication(
            @PathVariable UUID applicationId,
            @RequestBody LegacyAcceptApplicationPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Application application = applicationService.accept(
                applicationId,
                authenticatedUser,
                payload.getAdvisorId(),
                payload.getComment(),
                payload.getNotifyUser()
        );

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application));
    }
}
