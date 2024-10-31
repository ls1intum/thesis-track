package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import thesistrack.ls1.constants.StringLimits;
import thesistrack.ls1.controller.payload.CloseTopicPayload;
import thesistrack.ls1.controller.payload.ReplaceTopicPayload;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.TopicDto;
import thesistrack.ls1.entity.Topic;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.service.ApplicationService;
import thesistrack.ls1.service.AuthenticationService;
import thesistrack.ls1.service.TopicService;
import thesistrack.ls1.utility.RequestValidator;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/topics")
public class TopicController {
    private final TopicService topicService;
    private final AuthenticationService authenticationService;
    private final ApplicationService applicationService;

    @Autowired
    public TopicController(TopicService topicService, AuthenticationService authenticationService, ApplicationService applicationService) {
        this.topicService = topicService;
        this.authenticationService = authenticationService;
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<PaginationDto<TopicDto>> getTopics(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "") String[] type,
            @RequestParam(required = false, defaultValue = "false") Boolean includeClosed,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) {
        Page<Topic> topics = topicService.getAll(
                type,
                includeClosed,
                search,
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(topics.map(TopicDto::fromTopicEntity)));
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<TopicDto> getTopic(@PathVariable UUID topicId) {
        Topic topic = topicService.findById(topicId);

        return ResponseEntity.ok(TopicDto.fromTopicEntity(topic));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<TopicDto> createTopic(
            @RequestBody ReplaceTopicPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);

        Topic topic = topicService.createTopic(
                authenticatedUser,
                RequestValidator.validateStringMaxLength(payload.title(), StringLimits.THESIS_TITLE.getLimit()),
                RequestValidator.validateStringSetItemMaxLengthAllowNull(payload.thesisTypes(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.problemStatement(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.requirements(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.goals(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.references(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateNotNull(payload.supervisorIds()),
                RequestValidator.validateNotNull(payload.advisorIds())
        );

        return ResponseEntity.ok(TopicDto.fromTopicEntity(topic));
    }

    @PutMapping("/{topicId}")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<TopicDto> updateTopic(
            @PathVariable UUID topicId,
            @RequestBody ReplaceTopicPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Topic topic = topicService.findById(topicId);

        topic = topicService.updateTopic(
                authenticatedUser,
                topic,
                RequestValidator.validateStringMaxLength(payload.title(), StringLimits.THESIS_TITLE.getLimit()),
                RequestValidator.validateStringSetItemMaxLengthAllowNull(payload.thesisTypes(), StringLimits.SHORTTEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.problemStatement(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.requirements(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.goals(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateStringMaxLength(payload.references(), StringLimits.UNLIMITED_TEXT.getLimit()),
                RequestValidator.validateNotNull(payload.supervisorIds()),
                RequestValidator.validateNotNull(payload.advisorIds())
        );

        return ResponseEntity.ok(TopicDto.fromTopicEntity(topic));
    }

    @DeleteMapping("/{topicId}")
    @PreAuthorize("hasAnyRole('admin', 'advisor', 'supervisor')")
    public ResponseEntity<TopicDto> closeTopic(
            @PathVariable UUID topicId,
            @RequestBody CloseTopicPayload payload,
            JwtAuthenticationToken jwt
    ) {
        User authenticatedUser = authenticationService.getAuthenticatedUser(jwt);
        Topic topic = topicService.findById(topicId);

        topic = applicationService.closeTopic(
                authenticatedUser,
                topic,
                RequestValidator.validateNotNull(payload.reason()),
                RequestValidator.validateNotNull(payload.notifyUser())
        );

        return ResponseEntity.ok(TopicDto.fromTopicEntity(topic));
    }
}
