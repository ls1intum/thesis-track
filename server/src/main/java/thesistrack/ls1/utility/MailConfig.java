package thesistrack.ls1.utility;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.TemplateEngine;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.repository.UserRepository;

import java.util.*;

@Component
public class MailConfig {
    private final UserRepository userRepository;

    private final Boolean enabled;

    @Getter
    private final String clientHost;

    @Getter
    private final InternetAddress sender;

    @Getter
    private final String signature;

    @Getter
    private final String workspaceUrl;

    @Getter
    private final List<InternetAddress> defaultBccRecipients;

    @Getter
    private final TemplateEngine templateEngine;

    @Autowired
    public MailConfig(
            @Value("${thesis-track.mail.enabled}") boolean enabled,
            @Value("${thesis-track.mail.sender}") InternetAddress sender,
            @Value("${thesis-track.mail.bcc-recipients}") String bccRecipientsList,
            @Value("${thesis-track.mail.signature}") String mailSignature,
            @Value("${thesis-track.mail.workspace-url}") String workspaceUrl,
            @Value("${thesis-track.client.host}") String clientHost,
            TemplateEngine templateEngine,
            UserRepository userRepository
    ) {
        this.enabled = enabled;
        this.sender = sender;
        this.workspaceUrl = workspaceUrl;
        this.signature = mailSignature;
        this.clientHost = clientHost;

        this.templateEngine = templateEngine;
        this.userRepository = userRepository;

        if (bccRecipientsList != null && !bccRecipientsList.isEmpty()) {
            List<String> addresses = Arrays.asList(bccRecipientsList.split(";"));
            addresses.removeIf(String::isEmpty);

            this.defaultBccRecipients = addresses.stream().map(address -> {
                try {
                    return new InternetAddress(address);
                } catch (AddressException e) {
                    throw new IllegalArgumentException("Invalid email address", e);
                }
            }).toList();
        } else {
            this.defaultBccRecipients = new ArrayList<>();
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public List<User> getChairMembers() {
        return userRepository.getRoleMembers(Set.of("admin", "supervisor", "advisor"));
    }

    public List<User> getChairStudents() {
        return userRepository.getRoleMembers(Set.of("student"));
    }

    public record MailConfigDto(
            String signature,
            String workspaceUrl,
            String clientHost
    ) {}

    public MailConfigDto getConfigDto() {
        return new MailConfigDto(
                Objects.requireNonNullElse(signature, ""),
                Objects.requireNonNullElse(workspaceUrl, ""),
                Objects.requireNonNullElse(getClientHost(), "")
        );
    }
}
