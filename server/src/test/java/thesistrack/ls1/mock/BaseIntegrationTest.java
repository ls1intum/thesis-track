package thesistrack.ls1.mock;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import thesistrack.ls1.ThesisTrackApplication;
import thesistrack.ls1.controller.payload.CreateApplicationPayload;
import thesistrack.ls1.controller.payload.CreateThesisPayload;
import thesistrack.ls1.controller.payload.ReplaceTopicPayload;
import thesistrack.ls1.repository.*;

import javax.sql.DataSource;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = ThesisTrackApplication.class
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnableJpaRepositories(basePackages = "thesistrack.ls1.repository")
@ComponentScan(basePackages = "thesistrack.ls1")
public abstract class BaseIntegrationTest {
    @Container
    private static final PostgreSQLContainer<?> postgreDBContainer;

    // db setup
    static {
        postgreDBContainer = new PostgreSQLContainer<>("postgres:15-alpine")
                .withDatabaseName("thesis_test")
                .withUsername("test")
                .withPassword("test");
        postgreDBContainer.start();
    }

    @DynamicPropertySource
    static void registerPgProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgreDBContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgreDBContainer::getUsername);
        registry.add("spring.datasource.password", postgreDBContainer::getPassword);
        registry.add("spring.datasource.driver-class-name", postgreDBContainer::getDriverClassName);

        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.jpa.show-sql", () -> "false");
        registry.add("spring.jpa.properties.hibernate.format_sql", () -> "false");

        registry.add("spring.liquibase.enabled", () -> "false");
    }

    // JWT setup
    protected static final String TEST_JWT_SECRET = "test-secret-key-for-jwt-tokens";
    protected static final Algorithm TEST_ALGORITHM = Algorithm.HMAC256(TEST_JWT_SECRET);

    @TestConfiguration
    @EnableWebSecurity
    static class TestSecurityConfig {
        @Bean
        @Primary
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .cors(Customizer.withDefaults())
                    .csrf(AbstractHttpConfigurer::disable)
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .oauth2ResourceServer(server -> {
                        server.jwt(jwt -> jwt.decoder(jwtDecoder()).jwtAuthenticationConverter(jwtAuthenticationConverter()));
                    });

            return http.build();
        }

        @Bean
        @Primary
        public JwtDecoder jwtDecoder() {
            return token -> {
                var decodedJWT = JWT.decode(token);

                Map<String, Object> headers = new HashMap<>();
                headers.put("alg", decodedJWT.getAlgorithm());
                headers.put("typ", decodedJWT.getType());

                Map<String, Object> claims = new HashMap<>();
                decodedJWT.getClaims().forEach((key, value) -> {
                    if (key.equals("exp") || key.equals("iat")) {
                        claims.put(key, Instant.ofEpochSecond(value.asLong()));
                    } else {
                        claims.put(key, value.as(Object.class));
                    }
                });

                return Jwt.withTokenValue(token)
                        .headers(h -> h.putAll(headers))
                        .claims(c -> c.putAll(claims))
                        .build();
            };
        }

        private JwtAuthenticationConverter jwtAuthenticationConverter() {
            JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

            converter.setJwtGrantedAuthoritiesConverter(jwt -> {
                List<String> roles = jwt.getClaimAsStringList("roles");
                if (roles == null) {
                    return Collections.emptyList();
                }
                return roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());
            });

            return converter;
        }
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected DataSource dataSource;

    @Autowired
    protected ObjectMapper objectMapper;

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

    @BeforeAll
    void setupDatabase() throws Exception {
        Database database = DatabaseFactory.getInstance()
                .findCorrectDatabaseImplementation(new JdbcConnection(dataSource.getConnection()));

        try (Liquibase liquibase = new Liquibase(
                "db/changelog/db.changelog-master.xml",
                new ClassLoaderResourceAccessor(),
                database)) {


            liquibase.update(new Contexts());
        }
    }

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
                .sign(TEST_ALGORITHM);
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