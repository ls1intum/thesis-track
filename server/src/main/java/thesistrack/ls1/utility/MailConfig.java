package thesistrack.ls1.utility;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;
import thesistrack.ls1.exception.MailingException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "thesis-track.mail")
public class MailConfig {
    @NotBlank
    private Boolean enabled;

    @NotBlank
    private String sender;

    @NotBlank
    private String signature;

    @NotBlank
    private String workspaceUrl;

    @NotBlank
    private String chairMemberRecipients;

    @NotBlank
    private String bccRecipients;

    @NotBlank
    private String mailTemplateLocation;

    public boolean isEnabled() {
        return enabled;
    }

    public InternetAddress getSender() {
        try {
            return new InternetAddress(sender);
        } catch (AddressException e) {
            throw new MailingException("Invalid email for sender");
        }
    }

    public List<InternetAddress> getChairMemberRecipients() {
        if (chairMemberRecipients != null && !chairMemberRecipients.isEmpty()) {
            List<String> addresses = Arrays.asList(chairMemberRecipients.split(";"));
            addresses.removeIf(String::isEmpty);

            return addresses.stream().map(address -> {
                try {
                    return new InternetAddress(address);
                } catch (AddressException e) {
                    throw new IllegalArgumentException("Invalid email address", e);
                }
            }).toList();
        } else {
            return new ArrayList<>();
        }
    }

    public List<InternetAddress> getBccRecipients() {
        if (bccRecipients != null && !bccRecipients.isEmpty()) {
            List<String> addresses = Arrays.asList(bccRecipients.split(";"));
            addresses.removeIf(String::isEmpty);

            return addresses.stream().map(address -> {
                try {
                    return new InternetAddress(address);
                } catch (AddressException e) {
                    throw new IllegalArgumentException("Invalid email address", e);
                }
            }).toList();
        } else {
            return new ArrayList<>();
        }
    }

    public String getTemplate(String name) {
        Path folder = Paths.get(mailTemplateLocation);
        Path filePath = folder.resolve(name + ".html");

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
