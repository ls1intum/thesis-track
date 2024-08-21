package thesistrack.ls1.service;

import jakarta.mail.internet.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import thesistrack.ls1.constants.ThesisCommentType;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.exception.MailingException;
import thesistrack.ls1.utility.MailBuilder;
import thesistrack.ls1.utility.MailConfig;

@Service
public class MailingService {
    private final JavaMailSender javaMailSender;
    private final UploadService uploadService;
    private final MailConfig config;

    @Autowired
    public MailingService(
            JavaMailSender javaMailSender,
            UploadService uploadService,
            MailConfig config
    ) {
        this.javaMailSender = javaMailSender;
        this.uploadService = uploadService;
        this.config = config;
    }

    public void sendApplicationCreatedEmail(Application application) throws MailingException {
        MailBuilder chairMailBuilder = new MailBuilder(this.config, "New Thesis Application", "application-created-chair");
        chairMailBuilder
                .addChairMemberRecipients()
                .addAttachment(application.getUser().getCvFilename())
                .addAttachment(application.getUser().getExaminationFilename())
                .addAttachment(application.getUser().getDegreeFilename())
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);

        MailBuilder studentMailBuilder = new MailBuilder(this.config, "Thesis Application Confirmation", "application-created-student");
        studentMailBuilder
                .addRecipient(MimeMessage.RecipientType.TO, application.getUser().getEmail())
                .addAttachment(application.getUser().getCvFilename())
                .addAttachment(application.getUser().getExaminationFilename())
                .addAttachment(application.getUser().getDegreeFilename())
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);
    }

    public void sendApplicationAcceptanceEmail(Application application, Thesis thesis) throws MailingException {
        User advisor = thesis.getAdvisors().getFirst();
        User supervisor = thesis.getSupervisors().getFirst();

        String template = advisor.getId().equals(supervisor.getId()) ? "application-accepted-no-advisor" : "application-accepted";

        MailBuilder builder = new MailBuilder(this.config, "Thesis Application Acceptance", template);
        builder
                .addBccRecipients()
                .addRecipient(MimeMessage.RecipientType.TO, application.getUser().getEmail())
                .addRecipient(MimeMessage.RecipientType.CC, advisor.getEmail())
                .fillUserPlaceholders(advisor, "advisor")
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);
    }

    public void sendApplicationRejectionEmail(Application application) throws MailingException {
        MailBuilder builder = new MailBuilder(this.config, "Thesis Application Rejection", "application-rejected");
        builder
                .addBccRecipients()
                .addRecipient(MimeMessage.RecipientType.TO, application.getUser().getEmail())
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);
    }

    public void sendThesisCreatedEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(this.config, "Thesis Created", "thesis-created");
        builder
                .addBccRecipients()
                .sendToThesisStudents(thesis)
                .fillThesisPlaceholders(thesis)
                .send(javaMailSender, uploadService);
    }

    public void sendThesisClosedEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(this.config, "Thesis Closed", "thesis-closed");
        builder
                .addBccRecipients()
                .sendToThesisStudents(thesis)
                .fillThesisPlaceholders(thesis)
                .send(javaMailSender, uploadService);
    }

    public void sendProposalUploadedEmail(ThesisProposal proposal) {
        MailBuilder builder = new MailBuilder(this.config, "Thesis Proposal Added", "thesis-proposal-uploaded");
        builder
                .sendToThesisAdvisors(proposal.getThesis())
                .fillThesisProposalPlaceholders(proposal)
                .send(javaMailSender, uploadService);
    }

    public void sendProposalAcceptedEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(this.config, "Thesis Proposal Accepted", "thesis-proposal-accepted");
        builder
                .sendToThesisStudents(thesis)
                .fillThesisPlaceholders(thesis)
                .send(javaMailSender, uploadService);
    }

    public void sendNewCommentEmail(ThesisComment comment) {
        MailBuilder builder = new MailBuilder(this.config, "New Thesis Comment", "thesis-comment-posted");

        if (comment.getType() == ThesisCommentType.ADVISOR) {
            builder.sendToThesisAdvisors(comment.getThesis());
        } else {
            builder.sendToThesisStudents(comment.getThesis());
        }

        builder
                .fillThesisCommentPlaceholders(comment)
                .send(javaMailSender, uploadService);
    }

    public void sendNewScheduledPresentationEmail(ThesisPresentation presentation) {
        MailBuilder builder = new MailBuilder(this.config, "New Presentation scheduled", "thesis-presentation-scheduled");
        builder
                .addBccRecipients()
                .sendToThesisStudents(presentation.getThesis())
                .fillThesisPresentationPlaceholders(presentation)
                .send(javaMailSender, uploadService);
    }

    public void sendPresentationDeletedEmail(ThesisPresentation presentation) {
        MailBuilder builder = new MailBuilder(this.config, "Presentation deleted", "thesis-presentation-deleted");
        builder
                .addBccRecipients()
                .sendToThesisStudents(presentation.getThesis())
                .fillThesisPresentationPlaceholders(presentation)
                .send(javaMailSender, uploadService);
    }

    public void sendFinalSubmissionEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(this.config, "Thesis Submitted", "thesis-final-submission");
        builder
                .addBccRecipients()
                .sendToThesisAdvisors(thesis)
                .fillThesisPlaceholders(thesis)
                .send(javaMailSender, uploadService);
    }

    public void sendAssessmentAddedEmail(ThesisAssessment assessment) {
        MailBuilder builder = new MailBuilder(this.config, "Assessment added", "thesis-assessment-added");
        builder
                .sendToThesisAdvisors(assessment.getThesis())
                .fillThesisAssessmentPlaceholders(assessment)
                .send(javaMailSender, uploadService);
    }

    public void sendFinalGradeEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(this.config, "Final Grade available for Thesis", "thesis-final-grade");
        builder
                .addBccRecipients()
                .sendToThesisStudents(thesis)
                .fillThesisPlaceholders(thesis)
                .send(javaMailSender, uploadService);
    }
}
