package thesistrack.ls1.service;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.UploadFileType;
import thesistrack.ls1.entity.NotificationSetting;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.entity.UserGroup;
import thesistrack.ls1.entity.key.NotificationSettingId;
import thesistrack.ls1.entity.key.UserGroupId;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.NotificationSettingRepository;
import thesistrack.ls1.repository.UserGroupRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;
    private final UploadService uploadService;
    private final NotificationSettingRepository notificationSettingRepository;

    @Autowired
    public AuthenticationService(UserRepository userRepository, UserGroupRepository userGroupRepository, UploadService uploadService, NotificationSettingRepository notificationSettingRepository) {
        this.userRepository = userRepository;
        this.userGroupRepository = userGroupRepository;
        this.uploadService = uploadService;
        this.notificationSettingRepository = notificationSettingRepository;
    }

    public User getAuthenticatedUser(JwtAuthenticationToken jwt) {
        return userRepository.findByUniversityId(getUniversityId(jwt))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    @Transactional
    public User updateAuthenticatedUser(JwtAuthenticationToken jwt) {
        Map<String, Object> attributes = jwt.getTokenAttributes();
        String universityId = getUniversityId(jwt);

        String email = (String) attributes.get("email");
        String firstName = (String) attributes.get("given_name");
        String lastName = (String) attributes.get("family_name");

        List<String> groups = jwt.getAuthorities().stream()
                .filter(authority -> authority.getAuthority().startsWith("ROLE_"))
                .map(authority -> authority.getAuthority().replace("ROLE_", "")).toList();

        User user = userRepository.findByUniversityId(universityId).orElseGet(() -> {
            User newUser = new User();
            Instant currentTime = Instant.now();

            newUser.setJoinedAt(currentTime);
            newUser.setUpdatedAt(currentTime);

            return newUser;
        });

        user.setUniversityId(universityId);

        if (email != null && !email.isEmpty()) {
            user.setEmail(email);
        }

        if (firstName != null && !firstName.isEmpty()) {
            user.setFirstName(firstName);
        }

        if (lastName != null && !lastName.isEmpty()) {
            user.setLastName(lastName);
        }

        user = userRepository.save(user);

        userGroupRepository.deleteByUserId(user.getId());

        Set<UserGroup> userGroups = new HashSet<>();

        for (String group : groups) {
            UserGroup entity = new UserGroup();
            UserGroupId entityId = new UserGroupId();

            entityId.setUserId(user.getId());
            entityId.setGroup(group);

            entity.setUser(user);
            entity.setId(entityId);

            userGroups.add(userGroupRepository.save(entity));
        }

        user.setGroups(userGroups);

        return userRepository.save(user);
    }

    public User updateUserInformation(
            User user,
            String matriculationNumber,
            String firstName,
            String lastName,
            String gender,
            String nationality,
            String email,
            String studyDegree,
            String studyProgram,
            Instant enrolledAt,
            String specialSkills,
            String interests,
            String projects,
            Map<String, String> customData,
            MultipartFile avatar,
            MultipartFile examinationReport,
            MultipartFile cv,
            MultipartFile degreeReport
    ) {
        user.setMatriculationNumber(matriculationNumber);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setGender(gender);
        user.setNationality(nationality);
        user.setEmail(email);
        user.setStudyDegree(studyDegree);
        user.setStudyProgram(studyProgram);
        user.setEnrolledAt(enrolledAt);
        user.setSpecialSkills(specialSkills);
        user.setInterests(interests);
        user.setProjects(projects);
        user.setCustomData(customData);

        if (avatar != null) {
            user.setAvatar(avatar.isEmpty() ? null : uploadService.store(avatar, 1024 * 1024, UploadFileType.IMAGE));
        }

        user.setExaminationFilename(examinationReport == null ? null : uploadService.store(examinationReport, 3 * 1024 * 1024, UploadFileType.PDF));
        user.setCvFilename(cv == null ? null : uploadService.store(cv, 3 * 1024 * 1024, UploadFileType.PDF));
        user.setDegreeFilename(degreeReport == null ? null : uploadService.store(degreeReport, 3 * 1024 * 1024, UploadFileType.PDF));

        return userRepository.save(user);
    }

    public List<NotificationSetting> getNotificationSettings(User user) {
        return user.getNotificationSettings();
    }

    @Transactional
    public List<NotificationSetting> updateNotificationSettings(User user, String name, String email) {
        List<NotificationSetting> settings = user.getNotificationSettings();

        for (NotificationSetting setting : settings) {
            if (setting.getId().getName().equals(name)) {
                setting.setEmail(email);
                setting.setUpdatedAt(Instant.now());

                notificationSettingRepository.save(setting);

                return settings;
            }
        }

        NotificationSettingId entityId = new NotificationSettingId();
        entityId.setName(name);
        entityId.setUserId(user.getId());

        NotificationSetting entity = new NotificationSetting();
        entity.setId(entityId);
        entity.setUpdatedAt(Instant.now());
        entity.setEmail(email);
        entity.setUser(user);

        settings.add(notificationSettingRepository.save(entity));

        user.setNotificationSettings(settings);

        return settings;
    }

    private String getUniversityId(JwtAuthenticationToken jwt) {
        return jwt.getName();
    }
}
