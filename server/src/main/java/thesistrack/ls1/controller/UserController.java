package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import thesistrack.ls1.dto.LightUserDto;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.UserService;

@Slf4j
@RestController
@RequestMapping("/v1/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('admin', 'advisor')")
    public ResponseEntity<Page<LightUserDto>> getUsers(
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false) String[] groups,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer limit,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) {
        Page<User> users = userService.getAll(searchQuery, groups, page, limit, sortBy, sortOrder);

        return ResponseEntity.ok(users.map(LightUserDto::fromUserEntity));
    }
}
