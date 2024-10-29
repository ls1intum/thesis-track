package thesistrack.ls1.controller;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import thesistrack.ls1.mock.BaseIntegrationTest;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers
public class UserControllerTest extends BaseIntegrationTest {
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
    void getUsers_AsAdmin_Success() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/v2/users")
                        .header("Authorization", createRandomAdminAuthentication())
                        .param("groups", "admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", isA(List.class)))
                .andExpect(jsonPath("$.content", hasSize(equalTo(1))))
                .andExpect(jsonPath("$.totalElements", isA(Number.class)));
    }

    @Test
    void getUsers_AsStudent_Forbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/v2/users")
                        .header("Authorization", createRandomAuthentication("student")))
                .andExpect(status().isForbidden());
    }
}
