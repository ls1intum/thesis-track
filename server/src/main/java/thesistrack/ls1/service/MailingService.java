package thesistrack.ls1.service;

import jakarta.mail.BodyPart;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Arrays;

@Service
public class MailingService {

    private final JavaMailSender javaMailSender;
    private final FileSystemStorageService storageService;
    private final String environment;
    private final String sender;
    private final String chairMemberRecipientsList;
    private final Path rootLocation;

    @Autowired
    public MailingService(final JavaMailSender javaMailSender,
                          final FileSystemStorageService storageService,
                          @Value("${thesis-track.environment}") String environment,
                          @Value("${thesis-track.mail.sender}") String sender,
                          @Value("${thesis-track.mail.chair-member-recipients}") String chairMemberRecipientsList) {
        this.javaMailSender = javaMailSender;
        this.storageService = storageService;
        this.environment = environment;
        this.sender = sender;
        this.chairMemberRecipientsList = chairMemberRecipientsList;
        this.rootLocation = Paths.get("mails");
    }

    public String getMailTemplate(final String filename) {
        return storageService.readFromFile(rootLocation, filename + ".html");
    }

    public void updateMailTemplate(final String filename, final String htmlContents) {
        storageService.writeToFile(rootLocation, filename + ".html", htmlContents);
    }

    public void thesisApplicationCreatedEmail(final Student student,
                                              final ThesisApplication thesisApplication) throws MessagingException, IOException {
        MimeMessage message = javaMailSender.createMimeMessage();

        message.setFrom(sender);
        Arrays.asList(chairMemberRecipientsList.split(";")).forEach(recipient -> {
            try {
                message.addRecipients(MimeMessage.RecipientType.TO, recipient);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        });

        message.setSubject("Thesis Track | New Thesis Application");

        String template = storageService.readFromFile(rootLocation, "thesis-application-created.html");
        template = fillStudentPlaceholders(template, student);
        template = fillThesisApplicationPlaceholders(template, thesisApplication);

        Multipart multipart = new MimeMultipart();

        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setContent(template, "text/html; charset=utf-8");
        multipart.addBodyPart(messageBodyPart);

        MimeBodyPart examinationReportAttachment = new MimeBodyPart();
        examinationReportAttachment.attachFile(new File("thesis_application_uploads/" + thesisApplication.getExaminationReportFilename()));
        multipart.addBodyPart(examinationReportAttachment);

        MimeBodyPart cvAttachment = new MimeBodyPart();
        cvAttachment.attachFile(new File("thesis_application_uploads/" + thesisApplication.getCvFilename()));
        multipart.addBodyPart(cvAttachment);

        if (thesisApplication.getBachelorReportFilename() != null && !thesisApplication.getBachelorReportFilename().isBlank()) {
            MimeBodyPart bachelorReportAttachment = new MimeBodyPart();
            bachelorReportAttachment.attachFile(new File("thesis_application_uploads/" + thesisApplication.getBachelorReportFilename()));
            multipart.addBodyPart(bachelorReportAttachment);
        }

        message.setContent(multipart);

        javaMailSender.send(message);
    }

    public void sendThesisApplicationConfirmationEmail(final Student student,
                                              final ThesisApplication thesisApplication) throws MessagingException, IOException {
        MimeMessage message = javaMailSender.createMimeMessage();

        message.setFrom(sender);
        message.setRecipients(MimeMessage.RecipientType.TO, student.getEmail());

        message.setSubject("Thesis Track | Thesis Application Confirmation");

        String template = storageService.readFromFile(rootLocation, "thesis-application-confirmation.html");
        template = fillStudentPlaceholders(template, student);
        template = fillThesisApplicationPlaceholders(template, thesisApplication);

        Multipart multipart = new MimeMultipart();

        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setContent(template, "text/html; charset=utf-8");
        multipart.addBodyPart(messageBodyPart);

        MimeBodyPart examinationReportAttachment = new MimeBodyPart();
        examinationReportAttachment.attachFile(new File("thesis_application_uploads/" + thesisApplication.getExaminationReportFilename()));
        multipart.addBodyPart(examinationReportAttachment);

        MimeBodyPart cvAttachment = new MimeBodyPart();
        cvAttachment.attachFile(new File("thesis_application_uploads/" + thesisApplication.getCvFilename()));
        multipart.addBodyPart(cvAttachment);

        if (thesisApplication.getBachelorReportFilename() != null && !thesisApplication.getBachelorReportFilename().isBlank()) {
            MimeBodyPart bachelorReportAttachment = new MimeBodyPart();
            bachelorReportAttachment.attachFile(new File("thesis_application_uploads/" + thesisApplication.getBachelorReportFilename()));
            multipart.addBodyPart(bachelorReportAttachment);
        }

        message.setContent(multipart);

        javaMailSender.send(message);
    }

    public void sendThesisAcceptanceEmail(final Student student,
                                          final ThesisApplication thesisApplication,
                                          final ThesisAdvisor thesisAdvisor) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();

        message.setFrom(sender);
        message.setRecipients(MimeMessage.RecipientType.TO, student.getEmail());
        if (environment.equals("prod")) {
            message.addRecipients(MimeMessage.RecipientType.CC, "krusche@tum.de");
        }
        message.addRecipients(MimeMessage.RecipientType.BCC, "valeryia.andraichuk@tum.de");
        message.setSubject("Thesis Application Acceptance");

        String template;
        if (!thesisAdvisor.getEmail().equals("krusche@tum.de")) {
            message.addRecipients(MimeMessage.RecipientType.CC, thesisAdvisor.getEmail());

            template = storageService.readFromFile(rootLocation, "thesis-application-acceptance.html");
            template = fillThesisAdvisorPlaceholders(template, thesisAdvisor);
        } else {
            template = storageService.readFromFile(rootLocation, "thesis-application-acceptance-no-advisor.html");
        }
        template = fillStudentPlaceholders(template, student);
        template = fillThesisApplicationPlaceholders(template, thesisApplication);
        message.setContent(template, "text/html; charset=utf-8");

        javaMailSender.send(message);
    }

    public void sendThesisRejectionEmail(final Student student, final ThesisApplication thesisApplication) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();

        message.setFrom(sender);
        message.setRecipients(MimeMessage.RecipientType.TO, student.getEmail());
        if (environment.equals("prod")) {
            message.addRecipients(MimeMessage.RecipientType.BCC, "krusche@tum.de");
        }
        message.addRecipients(MimeMessage.RecipientType.BCC, "valeryia.andraichuk@tum.de");
        message.setSubject("Thesis Application Rejection");

        String template = storageService.readFromFile(rootLocation, "thesis-application-rejection.html");
        template = fillStudentPlaceholders(template, student);
        template = fillThesisApplicationPlaceholders(template, thesisApplication);

        message.setContent(template, "text/html; charset=utf-8");

        javaMailSender.send(message);
    }

    private String fillStudentPlaceholders(final String template, final Student student) {
        return template
                .replace("{{student.firstName}}", student.getFirstName())
                .replace("{{student.lastName}}", student.getLastName())
                .replace("{{student.email}}", student.getEmail())
                .replace("{{student.tumId}}", student.getTumId())
                .replace("{{student.matriculationNumber}}", student.getMatriculationNumber())
                .replace("{{student.gender}}", student.getGender().getValue())
                .replace("{{student.nationality}}", student.getNationality())
                .replace("{{student.isExchangeStudent}}", student.getIsExchangeStudent().toString());
    }

    private String fillThesisApplicationPlaceholders(final String template, final ThesisApplication thesisApplication) {
        String pattern = "dd. MMM yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

        return template.replace("{{application.studyProgram}}", thesisApplication.getStudyProgram().getValue())
                .replace("{{application.studyDegree}}", thesisApplication.getStudyDegree().getValue())
                .replace("{{application.currentSemester}}", thesisApplication.getCurrentSemester().toString())
                .replace("{{application.desiredThesisStart}}", simpleDateFormat.format(thesisApplication.getDesiredThesisStart()))
                .replace("{{application.specialSkills}}", thesisApplication.getSpecialSkills())
                .replace("{{application.motivation}}", thesisApplication.getMotivation())
                .replace("{{application.interests}}", thesisApplication.getInterests())
                .replace("{{application.projects}}", thesisApplication.getProjects())
                .replace("{{application.specialSkills}}", thesisApplication.getSpecialSkills())
                .replace("{{application.thesisTitle}}", thesisApplication.getThesisTitle())
                .replace("{{application.researchAreas}}", String.join(", ", thesisApplication.getResearchAreas().stream().map(ResearchArea::getValue).toList()))
                .replace("{{application.focusTopics}}", String.join(", ", thesisApplication.getFocusTopics().stream().map(FocusTopic::getValue).toList()));
    }

    private String fillThesisAdvisorPlaceholders(final String template, final ThesisAdvisor thesisAdvisor) {
        return template.replace("{{advisor.firstName}}", thesisAdvisor.getFirstName())
                .replace("{{advisor.lastName}}", thesisAdvisor.getLastName())
                .replace("{{advisor.email}}", thesisAdvisor.getEmail())
                .replace("{{advisor.tumId}}", thesisAdvisor.getTumId());
    }
}
