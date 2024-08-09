package thesistrack.ls1.service;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.entity.UserGroup;
import thesistrack.ls1.entity.key.UserGroupId;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.UserGroupRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;

    @Autowired
    public AuthenticationService(UserRepository userRepository, UserGroupRepository userGroupRepository) {
        this.userRepository = userRepository;
        this.userGroupRepository = userGroupRepository;
    }

    public User getAuthenticatedUser(JwtAuthenticationToken jwt) {
        return this.userRepository.findByUniversityId(getUniversityId(jwt))
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

        User user = this.userRepository.findByUniversityId(universityId).orElseGet(() -> {
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

        user = this.userRepository.save(user);
        Set<UserGroup> userGroups = new HashSet<>();

        for (String group : groups) {
            UserGroup entity = new UserGroup();
            UserGroupId entityId = new UserGroupId();

            entityId.setUserId(user.getId());
            entityId.setGroup(group);

            entity.setUser(user);
            entity.setId(entityId);

            userGroups.add(this.userGroupRepository.save(entity));
        }

        user.setGroups(userGroups);

        return this.userRepository.save(user);
    }

    private String getUniversityId(JwtAuthenticationToken jwt) {
        return jwt.getName();
    }
}
