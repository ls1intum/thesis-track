package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.PublishedPresentationDto;
import thesistrack.ls1.dto.TaskDto;
import thesistrack.ls1.entity.ThesisPresentation;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.DashboardService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v2/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final AuthenticationService authenticationService;

    @Autowired
    public DashboardController(DashboardService dashboardService, AuthenticationService authenticationService) {
        this.dashboardService = dashboardService;
        this.authenticationService = authenticationService;
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getTasks(JwtAuthenticationToken jwt) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);

        return ResponseEntity.ok(dashboardService.getTasks(authenticatedUser));
    }

    @GetMapping("/presentations")
    public ResponseEntity<PaginationDto<PublishedPresentationDto>> getPresentations(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "scheduledAt") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder
    ) {
        Page<ThesisPresentation> presentations = dashboardService.getPresentations(
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(
                presentations.map(PublishedPresentationDto::fromPresentationEntity)
        ));
    }
}
