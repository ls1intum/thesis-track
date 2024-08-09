package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import thesistrack.ls1.dto.LightUserDto;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.UserService;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<PaginationDto<LightUserDto>> getUsers(
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) String[] groups,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "joinedAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) {
        Page<User> users = userService.getAll(searchQuery, groups, page, limit, sortBy, sortOrder);

        return ResponseEntity.ok(PaginationDto.fromSpringPage(users.map(LightUserDto::fromUserEntity)));
    }

    @GetMapping("/{userId}/examination-report")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<Resource> getExaminationReport(@PathVariable UUID userId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=examination_report_%s.pdf", userId))
                .body(userService.getExaminationReport(userId));
    }

    @GetMapping("/{userId}/cv")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<Resource> getCV(@PathVariable UUID userId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=cv_%s.pdf", userId))
                .body(userService.getCV(userId));
    }

    @GetMapping("/{userId}/degree-report")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<Resource> getDegreeReport(@PathVariable UUID userId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=degree_report_%s.pdf", userId))
                .body(userService.getDegreeReport(userId));
    }
}
