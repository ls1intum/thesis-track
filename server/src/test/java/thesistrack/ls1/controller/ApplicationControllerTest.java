package thesistrack.ls1.controller;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.controller.payload.AcceptApplicationPayload;
import thesistrack.ls1.controller.payload.CreateApplicationPayload;
import thesistrack.ls1.controller.payload.UpdateApplicationCommentPayload;
import thesistrack.ls1.mock.BaseIntegrationTest;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
class ApplicationControllerTest extends BaseIntegrationTest {
    @Container
    static PostgreSQLContainer<?> dbContainer = new PostgreSQLContainer<>(
            "postgres:16-alpine"
    );

    @BeforeAll
    static void startDatabase() {
        dbContainer.start();
    }

    @AfterAll
    static void stopDatabase() {
        dbContainer.stop();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        dbContainer.start();

        registry.add("spring.datasource.url", dbContainer::getJdbcUrl);
        registry.add("spring.datasource.username", dbContainer::getUsername);
        registry.add("spring.datasource.password", dbContainer::getPassword);
    }

    @Test
    void createApplication_Success() throws Exception {
        CreateApplicationPayload payload = new CreateApplicationPayload(
                null,
                "Test Thesis",
                "MASTER",
                Instant.now(),
                "Test motivation"
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/v2/applications")
                        .header("Authorization", createRandomAdminAuthentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.thesisTitle").value("Test Thesis"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.thesisType").value("MASTER"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.motivation").value("Test motivation"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.state").value(ApplicationState.NOT_ASSESSED.getValue()));
    }

    @Test
    void updateApplication_Success() throws Exception {
        String authorization = createRandomAdminAuthentication();
        UUID applicationId = createTestApplication(authorization, "Application");
        CreateApplicationPayload updatePayload = new CreateApplicationPayload(
                null,
                "Updated Thesis",
                "BACHELOR",
                Instant.now(),
                "Updated motivation"
        );

        mockMvc.perform(MockMvcRequestBuilders.put("/v2/applications/" + applicationId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePayload))
                )
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.thesisTitle").value("Updated Thesis"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.thesisType").value("BACHELOR"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.motivation").value("Updated motivation"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.state").value(ApplicationState.NOT_ASSESSED.getValue()));
    }

    @Test
    void updateApplicationComment_Success() throws Exception {
        UUID applicationId = createTestApplication(createRandomAdminAuthentication(), "Application");

        UpdateApplicationCommentPayload payload = new UpdateApplicationCommentPayload("Test comment");

        mockMvc.perform(MockMvcRequestBuilders.put("/v2/applications/" + applicationId + "/comment")
                        .header("Authorization", createRandomAdminAuthentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                )
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.comment").value("Test comment"));
    }

    @Test
    void acceptApplication_Success() throws Exception {
        UUID applicationId = createTestApplication(createRandomAdminAuthentication(), "Application");
        UUID advisorId = createTestUser("advisor", List.of("advisor"));
        UUID supervisorId = createTestUser("supervisor", List.of("supervisor"));

        AcceptApplicationPayload payload = new AcceptApplicationPayload(
                "Final Thesis Title",
                "MASTER",
                List.of(advisorId),
                List.of(supervisorId),
                true,
                true
        );

        mockMvc.perform(MockMvcRequestBuilders.put("/v2/applications/" + applicationId + "/accept")
                        .header("Authorization", createRandomAdminAuthentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].state").value(ApplicationState.ACCEPTED.getValue()));
    }
}