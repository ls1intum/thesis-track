package thesistrack.ls1.service;

import io.netty.handler.logging.LogLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.logging.AdvancedByteBufFormat;
import thesistrack.ls1.entity.User;

import org.springframework.http.HttpHeaders;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class AccessManagementService {
    private static final Logger logger = LoggerFactory.getLogger(AccessManagementService.class);
    private final WebClient webClient;

    private final String keycloakRealmName;
    private final String serviceClientId;
    private final String serviceClientSecret;
    private final UUID studentGroupId;

    private String accessToken;
    private Instant tokenExpiration;

    @Autowired
    public AccessManagementService(
            @Value("${thesis-track.keycloak.host}") String keycloakHost,
            @Value("${thesis-track.keycloak.realm-name}") String keycloakRealmName,
            @Value("${thesis-track.keycloak.service-client.id}") String serviceClientId,
            @Value("${thesis-track.keycloak.service-client.secret}") String serviceClientSecret,
            @Value("${thesis-track.keycloak.service-client.student-group-name}") String studentGroupName
    ) {
        this.keycloakRealmName = keycloakRealmName;
        this.serviceClientId = serviceClientId;
        this.serviceClientSecret = serviceClientSecret;

        this.webClient = WebClient.builder()
                .baseUrl(keycloakHost)
                .build();

        UUID studentGroupId = null;
        try {
            studentGroupId = studentGroupName.isBlank() ? null : getGroupId(studentGroupName);
        } catch (RuntimeException exception) {
            logger.warn("Could not fetch group id from configured student group", exception);
        }
        this.studentGroupId = studentGroupId;
    }

    public void addStudentGroup(User user) {
        if (studentGroupId == null) {
            return;
        }

        try {
            assignKeycloakGroup(getUserId(user.getUniversityId()), studentGroupId);
        } catch (RuntimeException exception) {
            logger.warn("Could not assign keycloak group to user", exception);
        }
    }

    public void removeStudentGroup(User user) {
        if (studentGroupId == null) {
            return;
        }

        try {
            removeKeycloakGroup(getUserId(user.getUniversityId()), studentGroupId);
        } catch (RuntimeException exception) {
            logger.warn("Could not remove keycloak group from user", exception);
        }
    }

    private void assignKeycloakGroup(UUID userId, UUID groupId) {
        if (userId == null || groupId == null) {
            throw new RuntimeException("User id or group id is null");
        }

        webClient.put()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/" + keycloakRealmName + "/users/" + userId +"/groups/" + groupId)
                        .build())
                .headers(headers -> headers.addAll(getAuthenticationHeaders()))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    private void removeKeycloakGroup(UUID userId, UUID groupId) {
        if (userId == null || groupId == null) {
            throw new RuntimeException("User id or group id is null");
        }

        webClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/" + keycloakRealmName + "/users/" + userId +"/groups/" + groupId)
                        .build())
                .headers(headers -> headers.addAll(getAuthenticationHeaders()))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    private record TokensResponse(String access_token) { }

    private HttpHeaders getAuthenticationHeaders() {
        if (tokenExpiration == null || Instant.now().isAfter(tokenExpiration)) {
            Object accessTokenResult = webClient.post()
                    .uri("/realms/" + keycloakRealmName + "/protocol/openid-connect/token")
                    .body(
                            BodyInserters.fromFormData("grant_type", "client_credentials")
                                    .with("client_id", serviceClientId)
                                    .with("client_secret", serviceClientSecret)
                    )
                    .retrieve()
                    .bodyToMono(TokensResponse.class)
                    .block()
                    .access_token();

            if (accessTokenResult == null) {
                throw new RuntimeException("Access token not returned");
            }

            accessToken = accessTokenResult.toString();
            tokenExpiration = Instant.now().plus(30, ChronoUnit.SECONDS);
        }

        HttpHeaders authenticationHeaders = new HttpHeaders();
        authenticationHeaders.set("Authorization", "Bearer " + accessToken);

        return authenticationHeaders;
    }

    private record GroupElement(UUID id, String name) {}

    private UUID getGroupId(String groupName) {
        List<GroupElement> groups = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/" + keycloakRealmName + "/groups")
                        .build())
                .headers(headers -> headers.addAll(getAuthenticationHeaders()))
                .retrieve()
                .bodyToFlux(GroupElement.class)
                .collectList()
                .block();

        return groups.stream()
                .filter(group -> group.name().equals(groupName))
                .findFirst()
                .map(GroupElement::id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupName));
    }

    private record UserElement(UUID id) {}

    private UUID getUserId(String username) {
        List<UserElement> users = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/" + keycloakRealmName + "/users")
                        .queryParam("username", username)
                        .build())
                .headers(headers -> headers.addAll(getAuthenticationHeaders()))
                .retrieve()
                .bodyToFlux(UserElement.class)
                .collectList()
                .block();

        return users.stream()
                .findFirst()
                .map(UserElement::id)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
