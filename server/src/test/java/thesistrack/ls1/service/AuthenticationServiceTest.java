package thesistrack.ls1.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import thesistrack.ls1.constants.UploadFileType;
import thesistrack.ls1.entity.NotificationSetting;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.entity.key.NotificationSettingId;
import thesistrack.ls1.mock.EntityMockFactory;
import thesistrack.ls1.repository.NotificationSettingRepository;
import thesistrack.ls1.repository.UserGroupRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private UserGroupRepository userGroupRepository;

    @Mock
    private UploadService uploadService;

    @Mock
    private NotificationSettingRepository notificationSettingRepository;

    @Mock
    private JwtAuthenticationToken jwtToken;

    private AuthenticationService authenticationService;
    private User testUser;
    private Map<String, Object> tokenAttributes;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                userRepository,
                userGroupRepository,
                uploadService,
                notificationSettingRepository
        );

        testUser = EntityMockFactory.createUser("Test");
    }

    @Test
    void updateUserInformation_WithAllFields_UpdatesUser() {
        MockMultipartFile avatar = new MockMultipartFile(
                "avatar",
                "avatar.jpg",
                "image/jpeg",
                "test".getBytes()
        );

        when(uploadService.store(any(), any(), any(UploadFileType.class))).thenReturn("stored-file");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = authenticationService.updateUserInformation(
                testUser,
                "M12345",
                "Updated",
                "User",
                "Male",
                "German",
                "updated@test.com",
                "Bachelor",
                "Computer Science",
                Instant.now(),
                "Java",
                "AI",
                "Thesis Track",
                Map.of("key", "value"),
                avatar,
                null,
                null,
                null
        );

        assertNotNull(result);
        verify(uploadService).store(any(), any(), eq(UploadFileType.IMAGE));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getNotificationSettings_ReturnsSettings() {
        List<NotificationSetting> settings = new ArrayList<>();
        NotificationSetting setting = new NotificationSetting();
        NotificationSettingId id = new NotificationSettingId();
        id.setName("test-notification");
        id.setUserId(testUser.getId());
        setting.setId(id);
        settings.add(setting);
        testUser.setNotificationSettings(settings);

        List<NotificationSetting> result = authenticationService.getNotificationSettings(testUser);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void updateNotificationSettings_WithNewSetting_CreatesSettings() {
        String settingName = "new-notification";
        String email = "yes";
        testUser.setNotificationSettings(new ArrayList<>());

        NotificationSetting newSetting = new NotificationSetting();
        NotificationSettingId id = new NotificationSettingId();
        id.setName(settingName);
        id.setUserId(testUser.getId());
        newSetting.setId(id);
        newSetting.setEmail(email);

        when(notificationSettingRepository.save(any(NotificationSetting.class))).thenReturn(newSetting);

        List<NotificationSetting> result = authenticationService.updateNotificationSettings(
                testUser,
                settingName,
                email
        );

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(notificationSettingRepository).save(any(NotificationSetting.class));
    }

    @Test
    void updateNotificationSettings_WithExistingSetting_UpdatesSettings() {
        String settingName = "existing-notification";
        String email = "yes";

        NotificationSetting existingSetting = new NotificationSetting();
        NotificationSettingId id = new NotificationSettingId();
        id.setName(settingName);
        id.setUserId(testUser.getId());
        existingSetting.setId(id);
        existingSetting.setEmail("no");

        List<NotificationSetting> settings = new ArrayList<>();
        settings.add(existingSetting);
        testUser.setNotificationSettings(settings);

        when(notificationSettingRepository.save(any(NotificationSetting.class))).thenReturn(existingSetting);

        List<NotificationSetting> result = authenticationService.updateNotificationSettings(
                testUser,
                settingName,
                email
        );

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(email, result.get(0).getEmail());
        verify(notificationSettingRepository).save(any(NotificationSetting.class));
    }
}