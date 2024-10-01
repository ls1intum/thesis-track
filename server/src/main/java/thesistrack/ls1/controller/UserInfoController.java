package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.StringLimits;
import thesistrack.ls1.controller.payload.UpdateUserInformationPayload;
import thesistrack.ls1.dto.UserDto;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.utility.RequestValidator;

@Slf4j
@RestController
@RequestMapping("/v2/user-info")
public class UserInfoController {
    private final AuthenticationService authenticationService;

    @Autowired
    public UserInfoController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping
    public ResponseEntity<UserDto> getInfo(JwtAuthenticationToken jwt) {
        User user = this.authenticationService.updateAuthenticatedUser(jwt);

        return ResponseEntity.ok(UserDto.fromUserEntity(user));
    }

    @RequestMapping(method = RequestMethod.PUT, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> updateInfo(
            @RequestPart("data") UpdateUserInformationPayload payload,
            @RequestPart(value = "examinationReport", required = false) MultipartFile examinationReport,
            @RequestPart(value = "cv", required = false) MultipartFile cv,
            @RequestPart(value = "degreeReport", required = false) MultipartFile degreeReport,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = this.authenticationService.getAuthenticatedUser(jwt);

        authenticatedUser = this.authenticationService.updateUserInformation(
                authenticatedUser,
                RequestValidator.validateStringMaxLengthAllowNull(payload.matriculationNumber(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.firstName(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.lastName(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.gender(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.nationality(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateEmailAllowNull(payload.email()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.studyDegree(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.studyProgram(), StringLimits.SHORTTEXT.getLimit()),
                payload.enrolledAt(),
                RequestValidator.validateStringMaxLengthAllowNull(payload.specialSkills(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.interests(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateStringMaxLengthAllowNull(payload.projects(), StringLimits.LONGTEXT.getLimit()),
                RequestValidator.validateNotNull(payload.customData()),
                avatar,
                examinationReport,
                cv,
                degreeReport
        );

        return ResponseEntity.ok(UserDto.fromUserEntity(authenticatedUser));
    }
}
