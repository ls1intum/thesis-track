package thesistrack.ls1.service;

import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.internet.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import thesistrack.ls1.entity.Application;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.exception.MailingException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

@Service
public class MailingService {
    private final JavaMailSender javaMailSender;
    private final UploadService uploadService;

    private final boolean enabled;

    private final String mailSignature;
    private final String workspaceUrl;

    private final InternetAddress sender;
    private final List<InternetAddress> chairMemberRecipientsList;
    private final List<InternetAddress> bccRecipientsList;

    private final Path mailTemplateLocation;

    @Autowired
    public MailingService(
            JavaMailSender javaMailSender,
            UploadService uploadService,
            @Value("${thesis-track.mail.enabled}") boolean enabled,
            @Value("${thesis-track.mail.mail-template-location}") String mailTemplateLocation,
            @Value("${thesis-track.mail.sender}") InternetAddress sender,
            @Value("${thesis-track.mail.chair-member-recipients}") String chairMemberRecipientsList,
            @Value("${thesis-track.mail.bcc-recipients}") String bccRecipientsList,
            @Value("${thesis-track.mail.signature}") String mailSignature,
            @Value("${thesis-track.mail.workspace-url}") String workspaceUrl
    ) {
        this.javaMailSender = javaMailSender;
        this.uploadService = uploadService;

        this.enabled = enabled;
        this.sender = sender;
        this.workspaceUrl = workspaceUrl;
        this.mailSignature = mailSignature;
        this.mailTemplateLocation = Paths.get(mailTemplateLocation);

        if (chairMemberRecipientsList != null && !chairMemberRecipientsList.isEmpty()) {
            List<String> addresses = Arrays.asList(chairMemberRecipientsList.split(";"));
            addresses.removeIf(String::isEmpty);

            this.chairMemberRecipientsList = addresses.stream().map(address -> {
                try {
                    return new InternetAddress(address);
                } catch (AddressException e) {
                    throw new IllegalArgumentException("Invalid email address", e);
                }
            }).toList();
        } else {
            this.chairMemberRecipientsList = new ArrayList<>();
        }

        if (bccRecipientsList != null && !bccRecipientsList.isEmpty()) {
            List<String> addresses = Arrays.asList(bccRecipientsList.split(";"));
            addresses.removeIf(String::isEmpty);

            this.bccRecipientsList = addresses.stream().map(address -> {
                try {
                    return new InternetAddress(address);
                } catch (AddressException e) {
                    throw new IllegalArgumentException("Invalid email address", e);
                }
            }).toList();
        } else {
            this.bccRecipientsList = new ArrayList<>();
        }
    }

    public void sendApplicationCreatedMailToChair(Application application) throws MailingException {
        if (!enabled) {
            return;
        }

        if (chairMemberRecipientsList.isEmpty()) {
            return;
        }

        try {
            MimeMessage message = createMailMessage(true);

            for (Address recipient : chairMemberRecipientsList) {
                message.addRecipient(MimeMessage.RecipientType.TO, recipient);
            }

            message.setSubject("New Thesis Application");

            String template = getMailTemplate("application-created-chair");
            template = fillUserPlaceholders(template, "student", application.getUser());
            template = fillApplicationPlaceholders(template, application);

            message.setContent(createApplicationFilesMailContent(template, application));

            javaMailSender.send(message);
        } catch (MessagingException | IOException e) {
            throw new MailingException("Failed to send email", e);
        }
    }

    public void sendApplicationCreatedMailToStudent(Application application) throws MailingException {
        if (!enabled) {
            return;
        }

        try {
            MimeMessage message = createMailMessage(false);

            message.setSubject("Thesis Application Confirmation");

            message.addRecipient(MimeMessage.RecipientType.TO, application.getUser().getEmail());

            String template = getMailTemplate("application-created-student");
            template = fillUserPlaceholders(template, "student", application.getUser());
            template = fillApplicationPlaceholders(template, application);

            message.setContent(createApplicationFilesMailContent(template, application));

            javaMailSender.send(message);
        } catch (MessagingException | IOException e) {
            throw new MailingException("Failed to send email", e);
        }
    }

    public void sendApplicationAcceptanceEmail(Application application, User advisor) throws MailingException {
        if (!enabled) {
            return;
        }

        try {
            MimeMessage message = createMailMessage(true);

            message.setSubject("Thesis Application Acceptance");

            message.addRecipient(MimeMessage.RecipientType.TO, application.getUser().getEmail());
            message.addRecipient(MimeMessage.RecipientType.CC, advisor.getEmail());

            String template = getMailTemplate("application-acceptance");
            template = fillUserPlaceholders(template, "advisor", advisor);
            template = fillUserPlaceholders(template, "student", application.getUser());
            template = fillApplicationPlaceholders(template, application);
            message.setContent(template, "text/html; charset=utf-8");

            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new MailingException("Failed to send email", e);
        }
    }

    public void sendApplicationRejectionEmail(Application application) throws MailingException {
        if (!enabled) {
            return;
        }

        try {
            MimeMessage message = createMailMessage(true);

            message.setSubject("Thesis Application Rejection");

            message.addRecipient(MimeMessage.RecipientType.TO, application.getUser().getEmail());

            String content = getMailTemplate("application-rejection");
            content = fillUserPlaceholders(content, "student", application.getUser());
            content = fillApplicationPlaceholders(content, application);

            message.setContent(content, "text/html; charset=utf-8");

            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new MailingException("Failed to send email", e);
        }
    }

    private String getMailTemplate(String name) throws MailingException {
        Path filePath = mailTemplateLocation.resolve(name + ".html");

        try {
            byte[] fileBytes = Files.readAllBytes(filePath);

            String template = new String(fileBytes, StandardCharsets.UTF_8);

            return template
                    .replace("{{config.signature}}", Objects.requireNonNullElse(mailSignature, ""))
                    .replace("{{config.workspaceUrl}}", Objects.requireNonNullElse(workspaceUrl, ""));
        } catch (IOException e) {
            throw new MailingException("Mail template not found", e);
        }
    }

    private MimeMessage createMailMessage(boolean includeBcc) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();

        message.setSender(sender);

        if (includeBcc) {
            for (Address bccRecipient : bccRecipientsList) {
                message.addRecipient(MimeMessage.RecipientType.BCC, bccRecipient);
            }
        }

        return message;
    }

    private String fillUserPlaceholders(String template, String placeholder, User user) {
        return template
                .replace("{{" + placeholder + ".firstName}}", Objects.requireNonNullElse(user.getFirstName(), ""))
                .replace("{{" + placeholder + ".lastName}}", Objects.requireNonNullElse(user.getLastName(), ""))
                .replace("{{" + placeholder + ".email}}", Objects.requireNonNullElse(user.getEmail() != null ? user.getEmail().toString() : "", ""))
                .replace("{{" + placeholder + ".tumId}}", Objects.requireNonNullElse(user.getUniversityId(), ""))
                .replace("{{" + placeholder + ".matriculationNumber}}", Objects.requireNonNullElse(user.getMatriculationNumber(), ""))
                .replace("{{" + placeholder + ".gender}}", Objects.requireNonNullElse(user.getGender(), ""))
                .replace("{{" + placeholder + ".nationality}}", Objects.requireNonNullElse(user.getNationality(), ""))
                .replace("{{" + placeholder + ".isExchangeStudent}}", Objects.requireNonNullElse(user.getIsExchangeStudent(), false).toString());
    }

    private String fillApplicationPlaceholders(String template, Application application) {
        String pattern = "dd. MMM yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        User student = application.getUser();

        return template.replace("{{application.studyProgram}}", Objects.requireNonNullElse(student.getStudyProgram(), ""))
                .replace("{{application.studyDegree}}", Objects.requireNonNullElse(student.getStudyDegree(), ""))
                .replace("{{application.enrolledAt}}", simpleDateFormat.format(
                        Date.from(Objects.requireNonNullElse(student.getEnrolledAt(), Instant.now())
                )))
                .replace("{{application.desiredThesisStart}}", simpleDateFormat.format(
                        Date.from(Objects.requireNonNullElse(application.getDesiredStartDate(), Instant.now())
                )))
                .replace("{{application.specialSkills}}", Objects.requireNonNullElse(student.getSpecialSkills(), ""))
                .replace("{{application.motivation}}", Objects.requireNonNullElse(application.getMotivation(), ""))
                .replace("{{application.interests}}", Objects.requireNonNullElse(student.getInterests(), ""))
                .replace("{{application.projects}}", Objects.requireNonNullElse(student.getProjects(), ""))
                .replace("{{application.specialSkills}}", Objects.requireNonNullElse(student.getSpecialSkills(), ""))
                .replace("{{application.thesisTitle}}", Objects.requireNonNullElse(application.getThesisTitle(), ""))
                .replace("{{application.researchAreas}}", String.join(", ", Objects.requireNonNullElse(student.getResearchAreas(), new HashSet<>())))
                .replace("{{application.focusTopics}}", String.join(", ", Objects.requireNonNullElse(student.getFocusTopics(), new HashSet<>())));
    }

    private Multipart createApplicationFilesMailContent(String text, Application application) throws MessagingException, IOException {
        Multipart multipart = new MimeMultipart();

        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setContent(text, "text/html; charset=utf-8");
        multipart.addBodyPart(messageBodyPart);

        addAttachment(multipart, application.getUser().getCvFilename());
        addAttachment(multipart, application.getUser().getExaminationFilename());
        addAttachment(multipart, application.getUser().getDegreeFilename());

        return multipart;
    }

    private void addAttachment(Multipart multipart, String filename) throws MessagingException, IOException {
        if (filename == null || filename.isBlank()) {
            return;
        }

        MimeBodyPart attachment = new MimeBodyPart();
        attachment.attachFile(uploadService.load(filename).getFile());
        multipart.addBodyPart(attachment);
    }
}
