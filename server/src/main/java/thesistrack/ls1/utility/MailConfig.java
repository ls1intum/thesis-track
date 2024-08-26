package thesistrack.ls1.utility;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.exception.MailingException;
import thesistrack.ls1.repository.UserRepository;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Component
public class MailConfig {
    private final UserRepository userRepository;

    private final Boolean enabled;
    private final Path templateLocation;

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

    @Autowired
    public MailConfig(
            @Value("${thesis-track.mail.enabled}") boolean enabled,
            @Value("${thesis-track.mail.mail-template-location}") String mailTemplateLocation,
            @Value("${thesis-track.mail.sender}") InternetAddress sender,
            @Value("${thesis-track.mail.bcc-recipients}") String bccRecipientsList,
            @Value("${thesis-track.mail.signature}") String mailSignature,
            @Value("${thesis-track.mail.workspace-url}") String workspaceUrl,
            @Value("${thesis-track.client.host}") String clientHost,
            UserRepository userRepository
    ) {
        this.enabled = enabled;
        this.sender = sender;
        this.workspaceUrl = workspaceUrl;
        this.signature = mailSignature;
        this.clientHost = clientHost;

        this.userRepository = userRepository;
        this.templateLocation = Paths.get(mailTemplateLocation);

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
        return userRepository.getChairMembers();
    }

    public String getTemplate(String name) {
        Path filePath = templateLocation.resolve(name + ".html");

        try {
            byte[] fileBytes = Files.readAllBytes(filePath);

            String template = new String(fileBytes, StandardCharsets.UTF_8);

            return template
                    .replace("{{config.signature}}", Objects.requireNonNullElse(signature, ""))
                    .replace("{{config.workspaceUrl}}", Objects.requireNonNullElse(workspaceUrl, ""));
        } catch (IOException e) {
            throw new MailingException("Mail template not found", e);
        }
    }
}
