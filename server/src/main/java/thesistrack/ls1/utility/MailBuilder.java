package thesistrack.ls1.utility;

import jakarta.activation.DataHandler;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.dto.ApplicationDto;
import thesistrack.ls1.dto.ThesisCommentDto;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.dto.UserDto;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.exception.MailingException;
import thesistrack.ls1.service.UploadService;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;

public class MailBuilder {
    private static final Logger log = LoggerFactory.getLogger(MailBuilder.class);
    private final MailConfig config;

    private final List<User> primarySenders;
    private final List<User> primaryRecipients;

    private final List<InternetAddress> secondaryRecipients;
    private final List<InternetAddress> bccRecipients;

    @Getter
    private String subject;

    @Getter
    private String content;

    @Getter
    private final List<String> fileAttachments;

    @Getter
    private final List<RawAttachment> rawAttachments;

    private record RawAttachment(String name, ByteArrayDataSource file) {}

    public MailBuilder(MailConfig config, String subject, String template) {
        this.config = config;

        this.primarySenders = new ArrayList<>();
        this.primaryRecipients = new ArrayList<>();
        this.secondaryRecipients = new ArrayList<>();
        this.bccRecipients = new ArrayList<>();

        this.subject = subject;
        this.content = config.getTemplate(template);
        this.fileAttachments = new ArrayList<>();
        this.rawAttachments = new ArrayList<>();
    }

    public MailBuilder addAttachmentFile(String filename) {
        if (filename == null || filename.isBlank()) {
            return this;
        }

        fileAttachments.add(filename);

        return this;
    }

    public MailBuilder addRawAttatchment(String filename, ByteArrayDataSource file) {
        if (filename == null || filename.isBlank()) {
            return this;
        }

        rawAttachments.add(new RawAttachment(filename, file));

        return this;
    }

    public MailBuilder addPrimarySender(User user) {
        this.primarySenders.add(user);

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

    public MailBuilder sendToChairStudents() {
        for (User user : config.getChairStudents()) {
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

    public MailBuilder fillPlaceholder(String placeholder, String value) {
        content = content.replace("{{" + placeholder + "}}", value);

        return this;
    }

    public MailBuilder fillUserPlaceholders(User user, String placeholder) {
        replaceDtoPlaceholders(UserDto.fromUserEntity(user), placeholder, getUserFormatters(placeholder));

        return this;
    }

    private HashMap<String, Function<Object, String>> getUserFormatters(String placeholder) {
        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put(placeholder + ".enrolledAt", DataFormatter::formatSemester);
        formatters.put(placeholder + ".gender", DataFormatter::formatConstantName);
        formatters.put(placeholder + ".studyDegree", DataFormatter::formatConstantName);
        formatters.put(placeholder + ".studyProgram", DataFormatter::formatConstantName);

        return formatters;
    }

    public MailBuilder fillApplicationPlaceholders(Application application) {
        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put("application.desiredStartDate", DataFormatter::formatDate);

        formatters.putAll(getUserFormatters("application.user"));

        replaceDtoPlaceholders(ApplicationDto.fromApplicationEntity(application, false), "application", formatters);

        content = content.replace("{{applicationUrl}}", config.getClientHost() + "/applications/" + application.getId());

        return this;
    }

    public MailBuilder fillThesisPlaceholders(Thesis thesis) {
        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put("thesis.startDate", DataFormatter::formatDate);
        formatters.put("thesis.endDate", DataFormatter::formatDate);
        formatters.put("thesis.type", DataFormatter::formatConstantName);
        formatters.put("thesis.visibility", DataFormatter::formatConstantName);

        formatters.put("thesis.students", DataFormatter::formatUsers);
        formatters.put("thesis.advisors", DataFormatter::formatUsers);
        formatters.put("thesis.supervisors", DataFormatter::formatUsers);

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

        HashMap<String, Function<Object, String>> formatters = new HashMap<>();

        formatters.put("presentation.type", DataFormatter::formatEnum);
        formatters.put("presentation.language", DataFormatter::formatConstantName);
        formatters.put("presentation.streamUrl", DataFormatter::formatOptionalString);
        formatters.put("presentation.location", DataFormatter::formatOptionalString);

        replaceDtoPlaceholders(ThesisDto.ThesisPresentationDto.fromPresentationEntity(presentation), "presentation", formatters);

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
            if (primarySenders.contains(recipient) && secondaryRecipients.isEmpty()) {
                continue;
            }

            try {
                MimeMessage message = mailSender.createMimeMessage();

                message.setFrom("ThesisTrack <" + config.getSender().getAddress() + ">");
                message.addRecipient(Message.RecipientType.TO, recipient.getEmail());

                for (InternetAddress address : secondaryRecipients) {
                    message.addRecipient(Message.RecipientType.CC, address);
                }

                for (InternetAddress address : bccRecipients) {
                    message.addRecipient(Message.RecipientType.BCC, address);
                }

                message.setSubject(subject);

                Multipart messageContent = new MimeMultipart();

                BodyPart messageBody = new MimeBodyPart();
                messageBody.setContent(
                        content.replace("{{recipientName}}", Objects.requireNonNullElse(recipient.getFirstName(), "")),
                        "text/html; charset=utf-8"
                );
                messageContent.addBodyPart(messageBody);

                for (String filename : fileAttachments) {
                    MimeBodyPart attachment = new MimeBodyPart();
                    attachment.attachFile(uploadService.load(filename).getFile());
                    messageContent.addBodyPart(attachment);
                }

                for (RawAttachment data : rawAttachments) {
                    MimeBodyPart attachment = new MimeBodyPart();

                    attachment.setDataHandler(new DataHandler(data.file()));
                    attachment.setFileName(data.name());

                    messageContent.addBodyPart(attachment);
                }

                message.setContent(messageContent);

                mailSender.send(message);
            } catch (MessagingException | IOException exception) {
                log.warn("Failed to send email", exception);
            }
        }
    }

    private void replaceDtoPlaceholders(Object dto, String dtoPrefix, Map<String, Function<Object, String>> formatters) {
        Field[] fields = dto.getClass().getDeclaredFields();

        for (Field field : fields) {
            field.setAccessible(true);

            try {
                Object value = field.get(dto);
                String placeholder = dtoPrefix + "." + field.getName();

                if (value != null) {
                    if (formatters.get(placeholder) != null) {
                        replacePlaceholder(placeholder, formatters.get(placeholder).apply(value));
                    } else if (value.getClass().isRecord()) {
                        replaceDtoPlaceholders(value, dtoPrefix + "." + field.getName(), formatters);
                    } else if (value instanceof Instant) {
                        replacePlaceholder(placeholder, DataFormatter.formatDateTime(value));
                    } else if (value.getClass().isEnum()) {
                        replacePlaceholder(placeholder, DataFormatter.formatEnum(value));
                    } else {
                        replacePlaceholder(placeholder, value.toString().replace("{{", "").replace("}}", ""));
                    }
                } else {
                    replacePlaceholder(placeholder, "");
                }
            } catch (IllegalAccessException e) {
                throw new RuntimeException("Failed to access field: " + field.getName(), e);
            }
        }
    }

    private void replacePlaceholder(String placeholder, String replacement) {
        content = content.replace("{{" + placeholder + "}}", Objects.requireNonNullElse(replacement, ""));
        subject = subject.replace("{{" + placeholder + "}}", Objects.requireNonNullElse(replacement, ""));
    }
}
