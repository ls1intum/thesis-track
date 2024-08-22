package thesistrack.ls1.utility;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import lombok.Getter;
import org.springframework.mail.javamail.JavaMailSender;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.dto.ApplicationDto;
import thesistrack.ls1.dto.ThesisCommentDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.dto.UserDto;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.exception.MailingException;
import thesistrack.ls1.service.UploadService;

import java.io.IOException;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;

public class MailBuilder {
    private final MailConfig config;

    private final List<User> primaryRecipients;
    private final List<InternetAddress> secondaryRecipients;
    private final List<InternetAddress> bccRecipients;

    @Getter
    private final String subject;

    @Getter
    private String content;

    @Getter
    private final List<String> attachments;

    public MailBuilder(MailConfig config, String subject, String template) {
        this.config = config;

        this.primaryRecipients = new ArrayList<>();
        this.secondaryRecipients = new ArrayList<>();
        this.bccRecipients = new ArrayList<>();

        this.subject = subject;
        this.content = config.getTemplate(template);
        this.attachments = new ArrayList<>();
    }

    public MailBuilder addAttachmentFile(String filename) {
        if (filename == null || filename.isBlank()) {
            return this;
        }

        attachments.add(filename);

        return this;
    }

    public MailBuilder addDefaultBccRecipients() {
        for (InternetAddress address : config.getDefaultBccRecipients()) {
            addBccRecipient(address);
        }

        return this;
    }

    public MailBuilder addPrimaryRecipient(User user) {
        primaryRecipients.add(user);

        return this;
    }

    public MailBuilder addSecondaryRecipient(InternetAddress address) {
        secondaryRecipients.add(address);

        return this;
    }

    public MailBuilder addBccRecipient(InternetAddress address) {
        bccRecipients.add(address);

        return this;
    }

    public MailBuilder sendToChairMembers() {
        for (User user : config.getChairMembers()) {
            addPrimaryRecipient(user);
        }

        return this;
    }

    public MailBuilder sendToThesisSupervisors(Thesis thesis) {
        for (ThesisRole role : thesis.getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.SUPERVISOR) {
                addPrimaryRecipient(role.getUser());
            }
        }

        return this;
    }

    public MailBuilder sendToThesisAdvisors(Thesis thesis) {
        for (ThesisRole role : thesis.getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.ADVISOR) {
                addPrimaryRecipient(role.getUser());
            } else if (role.getId().getRole() == ThesisRoleName.SUPERVISOR) {
                addSecondaryRecipient(role.getUser().getEmail());
            }
        }

        return this;
    }

    public MailBuilder sendToThesisStudents(Thesis thesis) {
        for (ThesisRole role : thesis.getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.STUDENT) {
                addPrimaryRecipient(role.getUser());
            } else {
                addSecondaryRecipient(role.getUser().getEmail());
            }
        }

        return this;
    }

    public MailBuilder fillUserPlaceholders(User user, String placeholder) {
        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put(placeholder + ".enrolledAt", DataFormatter::formatDate);

        replaceDtoPlaceholders(UserDto.fromUserEntity(user), placeholder, formatters);

        return this;
    }

    public MailBuilder fillApplicationPlaceholders(Application application) {
        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put("application.thesisTitle", (Object value) -> {
            if (application.getTopic() != null) {
                return application.getTopic().getTitle();
            }

            return Objects.requireNonNullElse(application.getThesisTitle(), "");
        });
        formatters.put("application.desiredThesisStart", DataFormatter::formatDate);
        formatters.put("application.user.enrolledAt", DataFormatter::formatDate);

        replaceDtoPlaceholders(ApplicationDto.fromApplicationEntity(application, false), "application", formatters);

        content = content.replace("{{applicationUrl}}", config.getClientHost() + "/applications/" + application.getId());

        return this;
    }

    public MailBuilder fillThesisPlaceholders(Thesis thesis) {
        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put("thesis.startDate", DataFormatter::formatDate);
        formatters.put("thesis.endDate", DataFormatter::formatDate);

        replaceDtoPlaceholders(ThesisDto.fromThesisEntity(thesis, false), "thesis", formatters);

        content = content.replace("{{thesisUrl}}", config.getClientHost() + "/theses/" + thesis.getId());

        return this;
    }

    public MailBuilder fillThesisCommentPlaceholders(ThesisComment comment) {
        fillThesisPlaceholders(comment.getThesis());
        replaceDtoPlaceholders(ThesisCommentDto.fromCommentEntity(comment), "comment", new HashMap<>());

        return this;
    }

    public MailBuilder fillThesisPresentationPlaceholders(ThesisPresentation presentation) {
        fillThesisPlaceholders(presentation.getThesis());
        replaceDtoPlaceholders(ThesisDto.ThesisPresentationDto.fromPresentationEntity(presentation), "presentation", new HashMap<>());

        return this;
    }

    public MailBuilder fillThesisProposalPlaceholders(ThesisProposal proposal) {
        fillThesisPlaceholders(proposal.getThesis());
        replaceDtoPlaceholders(ThesisDto.ThesisProposalDto.fromProposalEntity(proposal), "proposal", new HashMap<>());

        return this;
    }

    public MailBuilder fillThesisAssessmentPlaceholders(ThesisAssessment assessment) {
        fillThesisPlaceholders(assessment.getThesis());
        replaceDtoPlaceholders(ThesisDto.ThesisAssessmentDto.fromAssessmentEntity(assessment), "assessment", new HashMap<>());

        return this;
    }

    public void send(JavaMailSender mailSender, UploadService uploadService) throws MailingException {
        if (!config.isEnabled()) {
            return;
        }

        for (User recipient : primaryRecipients) {
            try {
                MimeMessage message = mailSender.createMimeMessage();

                message.setSubject(subject);
                message.setSender(config.getSender());
                message.addRecipient(Message.RecipientType.TO, recipient.getEmail());

                for (InternetAddress address : secondaryRecipients) {
                    message.addRecipient(Message.RecipientType.CC, address);
                }

                for (InternetAddress address : bccRecipients) {
                    message.addRecipient(Message.RecipientType.BCC, address);
                }

                Multipart messageContent = new MimeMultipart();

                BodyPart messageBody = new MimeBodyPart();
                messageBody.setContent(
                        content.replace("{{recipientName}}", Objects.requireNonNullElse(recipient.getFirstName(), "")),
                        "text/html; charset=utf-8"
                );
                messageContent.addBodyPart(messageBody);

                for (String filename : attachments) {
                    MimeBodyPart attachment = new MimeBodyPart();
                    attachment.attachFile(uploadService.load(filename).getFile());
                    messageContent.addBodyPart(attachment);
                }

                message.setContent(messageContent);

                mailSender.send(message);
            } catch (MessagingException | IOException e) {
                throw new MailingException("Failed to send email", e);
            }
        }
    }

    private void replaceDtoPlaceholders(Object dto, String dtoPrefix, Map<String, Function<Object, String>> formatters) {
        Field[] fields = dto.getClass().getDeclaredFields();

        for (Field field : fields) {
            field.setAccessible(true);

            try {
                Object value = field.get(dto);
                String identifier = dtoPrefix + "." + field.getName();
                String placeholder = "{{" + identifier + "}}";

                if (value != null) {
                    if (formatters.get(identifier) != null) {
                        content = content.replace(placeholder, formatters.get(identifier).apply(value));
                    } else if (value.getClass().isRecord()) {
                        replaceDtoPlaceholders(value, dtoPrefix + "." + field.getName(), formatters);
                    } else if (value instanceof Instant) {
                        content = content.replace(placeholder, DataFormatter.formatDateTime(value));
                    } else if (value.getClass().isEnum()) {
                        content = content.replace(placeholder, DataFormatter.formatEnum(value));
                    } else {
                        content = content.replace(placeholder, value.toString().replace("{{", "").replace("}}", ""));
                    }
                } else {
                    content = content.replace(placeholder, "");
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Failed to access field: " + field.getName(), e);
            }
        }
    }
}
