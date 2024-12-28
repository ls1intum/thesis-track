package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.PublishedThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.ThesisService;
import thesistrack.ls1.service.UploadService;
import thesistrack.ls1.service.UserService;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/v2/avatars")
public class AvatarController {
    private final UserService userService;
    private final UploadService uploadService;

    @Autowired
    public AvatarController(UserService userService, UploadService uploadService) {
        this.userService = userService;
        this.uploadService = uploadService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Resource> getTheses(@PathVariable UUID userId) {
        User user = userService.findById(userId);
        String avatar = user.getAvatar();

        if (avatar == null || avatar.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                .body(uploadService.load(avatar));
    }
}
