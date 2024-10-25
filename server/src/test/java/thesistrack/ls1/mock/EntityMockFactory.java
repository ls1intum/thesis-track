package thesistrack.ls1.mock;

import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.entity.key.ThesisRoleId;
import thesistrack.ls1.entity.key.UserGroupId;

import java.util.*;

public class EntityMockFactory {
    public static User createUser(String name) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFirstName(name);
        user.setLastName(name);
        user.setEmail(name.toLowerCase() + "@example.com");

        return user;
    }

    public static User createUserWithGroup(String name, String... groups) {
        User user = createUser(name);

        setupUserGroups(user, groups);

        return user;
    }

    public static void setupUserGroups(User user, String... groups) {
        Set<UserGroup> userGroups = new HashSet<>();
        for (String group : groups) {
            UserGroup entity = new UserGroup();
            UserGroupId entityId = new UserGroupId();

            entityId.setUserId(user.getId());
            entityId.setGroup(group);
            entity.setId(entityId);
            entity.setUser(user);

            userGroups.add(entity);
        }

        user.setGroups(userGroups);
    }

    public static Topic createTopic(String title) {
        Topic topic = new Topic();

        topic.setId(UUID.randomUUID());
        topic.setTitle(title);
        topic.setRoles(new ArrayList<>());

        return topic;
    }

    public static Application createApplication() {
        Application application = new Application();

        application.setId(UUID.randomUUID());
        application.setUser(createUser("user"));
        application.setTopic(createTopic("title"));
        application.setState(ApplicationState.NOT_ASSESSED);

        return application;
    }

    public static Thesis createThesis(String title) {
        Thesis thesis = new Thesis();

        thesis.setId(UUID.randomUUID());
        thesis.setTitle(title);
        thesis.setState(ThesisState.PROPOSAL);

        return thesis;
    }

    public static void setupThesisRole(Thesis thesis, User user, ThesisRoleName roleName) {
        ThesisRole role = new ThesisRole();
        ThesisRoleId roleId = new ThesisRoleId();

        role.setThesis(thesis);
        role.setUser(user);
        roleId.setRole(roleName);
        role.setId(roleId);

        thesis.setRoles(List.of(role));
    }
}
