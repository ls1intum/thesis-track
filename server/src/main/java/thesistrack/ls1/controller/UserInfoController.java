package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.dto.UserDto;
import thesistrack.ls1.service.AuthenticationService;

@Slf4j
@RestController
@RequestMapping("/v1/user-info")
public class UserInfoController {
    private final AuthenticationService authenticationService;

    @Autowired
    public UserInfoController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping
    public ResponseEntity<UserDto> getInfo(JwtAuthenticationToken jwt) {
        return ResponseEntity.ok(UserDto.fromUserEntity(this.authenticationService.getAuthenticatedUser(jwt)));
    }

    @PutMapping
    public ResponseEntity<UserDto> updateInfo() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }
}
