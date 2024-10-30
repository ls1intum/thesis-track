package thesistrack.ls1.mock;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import thesistrack.ls1.controller.payload.CreateApplicationPayload;
import thesistrack.ls1.controller.payload.CreateThesisPayload;
import thesistrack.ls1.controller.payload.ReplaceTopicPayload;
import thesistrack.ls1.repository.*;

import java.time.Instant;
import java.util.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Import(TestSecurityConfig.class)
public abstract class BaseIntegrationTest {
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private ApplicationReviewerRepository applicationReviewerRepository;
    @Autowired
    private NotificationSettingRepository notificationSettingRepository;
    @Autowired
    private ThesisAssessmentRepository thesisAssessmentRepository;
    @Autowired
    private ThesisCommentRepository thesisCommentRepository;
    @Autowired
    private ThesisFeedbackRepository thesisFeedbackRepository;
    @Autowired
    private ThesisFileRepository thesisFileRepository;
    @Autowired
    private ThesisPresentationInviteRepository thesisPresentationInviteRepository;
    @Autowired
    private ThesisPresentationRepository thesisPresentationRepository;
    @Autowired
    private ThesisProposalRepository thesisProposalRepository;
    @Autowired
    private ThesisRepository thesisRepository;
    @Autowired
    private ThesisRoleRepository thesisRoleRepository;
    @Autowired
    private ThesisStateChangeRepository thesisStateChangeRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private TopicRoleRepository topicRoleRepository;
    @Autowired
    private UserGroupRepository userGroupRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @BeforeEach
    void deleteDatabase() {
        thesisCommentRepository.deleteAll();
        thesisFeedbackRepository.deleteAll();
        thesisFileRepository.deleteAll();
        thesisPresentationInviteRepository.deleteAll();
        thesisAssessmentRepository.deleteAll();
        notificationSettingRepository.deleteAll();
        applicationReviewerRepository.deleteAll();
        thesisProposalRepository.deleteAll();

        thesisPresentationRepository.deleteAll();
        thesisStateChangeRepository.deleteAll();
        thesisRoleRepository.deleteAll();
        topicRoleRepository.deleteAll();

        thesisRepository.deleteAll();
        applicationRepository.deleteAll();
        topicRepository.deleteAll();
        userGroupRepository.deleteAll();

        userRepository.deleteAll();
    }

    protected String createRandomAuthentication(String role) throws Exception {
        String universityId = UUID.randomUUID().toString().replace("-", "").substring(0, 12);;

        createTestUser(universityId, List.of(role));

        return generateTestAuthenticationHeader(universityId, List.of(role));
    }

    protected String createRandomAdminAuthentication() throws Exception {
        return createRandomAuthentication("admin");
    }

    protected String generateTestAuthenticationHeader(String universityId, List<String> roles) {
        return "Bearer " + JWT.create()
                .withSubject(universityId)
                .withIssuedAt(Instant.now())
                .withExpiresAt(Instant.now().plusSeconds(3600))
                .withClaim("roles", roles)
                .withClaim("given_name", universityId)
                .withClaim("family_name", universityId)
                .withClaim("email", universityId + "@example.com")
                .sign(Algorithm.HMAC256("test-secret-key-for-jwt-tokens"));
    }

    protected UUID createTestUser(String universityId, List<String> roles) throws Exception {
        String response = mockMvc.perform(MockMvcRequestBuilders.post("/v2/user-info")
                        .header("Authorization", generateTestAuthenticationHeader(universityId, roles))
                )
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(JsonPath.parse(response).read("$.userId", String.class));
    }

    protected UUID createTestApplication(String authorization, String title) throws Exception {
        CreateApplicationPayload payload = new CreateApplicationPayload(
                null,
                title,
                "BACHELOR",
                Instant.now(),
                "Test motivation"
        );

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/v2/applications")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(JsonPath.parse(response).read("$.applicationId", String.class));
    }

    protected UUID createTestTopic(String title) throws Exception {
        UUID advisorId = createTestUser("supervisor", List.of("supervisor", "advisor"));

        ReplaceTopicPayload payload = new ReplaceTopicPayload(
                title,
                Set.of("MASTER"),
                "Test Problem Statement",
                "Test Requirements",
                "Test Goals",
                "Test References",
                List.of(advisorId),
                List.of(advisorId)
        );

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/v2/topics")
                        .header("Authorization", createRandomAdminAuthentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("topicId").asText().transform(UUID::fromString);
    }

    protected UUID createTestThesis(String title) throws Exception {
        UUID advisorId = createTestUser("supervisor", List.of("supervisor", "advisor"));

        CreateThesisPayload payload = new CreateThesisPayload(
                title,
                "MASTER",
                List.of(advisorId),
                List.of(advisorId),
                List.of(advisorId)
        );

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/v2/theses")
                        .header("Authorization", createRandomAdminAuthentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("thesisId").asText().transform(UUID::fromString);
    }
}