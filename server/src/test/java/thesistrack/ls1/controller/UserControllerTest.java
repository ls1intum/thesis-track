package thesistrack.ls1.controller;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.junit.jupiter.Testcontainers;
import thesistrack.ls1.mock.BaseIntegrationTest;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers
public class UserControllerTest extends BaseIntegrationTest {

    @DynamicPropertySource
    static void configureDynamicProperties(DynamicPropertyRegistry registry) {
        configureProperties(registry);
    }

    @Test
    void getUsers_Success() throws Exception {
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
