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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.dto.ApplicationDto;
import thesistrack.ls1.entity.Application;
import thesistrack.ls1.service.ApplicationService;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/applications")
public class ApplicationController {
    private final ApplicationService applicationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @RequestMapping(method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationDto> createApplication() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<Page<ApplicationDto>> getApplications(
            @RequestParam(required = false) String[] states,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer limit,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) {
        Page<Application> applications = applicationService.getAll(searchQuery, states, page, limit, sortBy, sortOrder);

        return ResponseEntity.ok(applications.map(ApplicationDto::fromApplicationEntity));
    }

    @GetMapping("/{applicationId}/examination-report")
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<Resource> getExaminationReport(@PathVariable UUID applicationId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=examination_report_%s.pdf", applicationId))
                .body(applicationService.getExaminationReport(applicationId));
    }

    @GetMapping("/{applicationId}/cv")
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<Resource> getCV(@PathVariable UUID applicationId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=cv_%s.pdf", applicationId))
                .body(applicationService.getCV(applicationId));
    }

    @GetMapping("/{applicationId}/bachelor-report")
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<Resource> getBachelorReport(@PathVariable UUID applicationId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=bachelor_report_%s.pdf", applicationId))
                .body(applicationService.getBachelorReport(applicationId));
    }

    @PutMapping("/{applicationId}/accept")
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<ApplicationDto> acceptApplication(@PathVariable String applicationId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<ApplicationDto> rejectApplication(
            @PathVariable UUID applicationId,
            @RequestPart("comment") String comment,
            @RequestPart("notifyStudent") boolean notifyStudent
    ) {
        Application application =  applicationService.reject(applicationId, comment, notifyStudent);

        return ResponseEntity.ok(ApplicationDto.fromApplicationEntity(application));
    }
}
