package thesistrack.ls1.service;

import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import thesistrack.ls1.constants.ThesisCommentType;
import thesistrack.ls1.constants.ApplicationRejectReason;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.utility.MailBuilder;
import thesistrack.ls1.utility.MailConfig;

import java.nio.charset.StandardCharsets;

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

    public void sendApplicationCreatedEmail(Application application) {
        MailBuilder chairMailBuilder = new MailBuilder(config, "New Thesis Application", "application-created-chair");
        chairMailBuilder
                .sendToChairMembers()
                .addAttachmentFile(application.getUser().getCvFilename())
                .addAttachmentFile(application.getUser().getExaminationFilename())
                .addAttachmentFile(application.getUser().getDegreeFilename())
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);

        MailBuilder studentMailBuilder = new MailBuilder(config, "Thesis Application Confirmation", "application-created-student");
        studentMailBuilder
                .addPrimaryRecipient(application.getUser())
                .addAttachmentFile(application.getUser().getCvFilename())
                .addAttachmentFile(application.getUser().getExaminationFilename())
                .addAttachmentFile(application.getUser().getDegreeFilename())
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);
    }

    public void sendApplicationAcceptanceEmail(Application application, Thesis thesis) {
        User advisor = thesis.getAdvisors().getFirst();
        User supervisor = thesis.getSupervisors().getFirst();

        String template = advisor.getId().equals(supervisor.getId()) ? "application-accepted-no-advisor" : "application-accepted";

        MailBuilder builder = new MailBuilder(config, "Thesis Application Acceptance", template);
        builder
                .addPrimaryRecipient(application.getUser())
                .addSecondaryRecipient(advisor.getEmail())
                .addDefaultBccRecipients()
                .fillUserPlaceholders(advisor, "advisor")
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);
    }

    public void sendApplicationRejectionEmail(Application application, ApplicationRejectReason reason) {
        MailBuilder builder = new MailBuilder(config, "Thesis Application Rejection", reason.getMailTemplate());
        builder
                .addPrimaryRecipient(application.getUser())
                .addDefaultBccRecipients()
                .fillApplicationPlaceholders(application)
                .send(javaMailSender, uploadService);
    }

    public void sendApplicationReminderEmail(long unreviewedApplications) {
        MailBuilder builder = new MailBuilder(config, "Unreviewed Thesis Applications", "application-reminder");
        builder
                .sendToChairMembers()
                .fillPlaceholder("unreviewedApplications", String.valueOf(unreviewedApplications))
                .fillPlaceholder("reviewApplicationsLink", config.getClientHost() + "/applications")
                .send(javaMailSender, uploadService);
    }

    public void sendThesisCreatedEmail(User creatingUser, Thesis thesis) {
        MailBuilder builder = new MailBuilder(config, "Thesis Created", "thesis-created");
        builder
                .sendToThesisStudents(thesis)
                .addDefaultBccRecipients()
                .fillThesisPlaceholders(thesis)
                .fillUserPlaceholders(creatingUser, "creatingUser")
                .send(javaMailSender, uploadService);
    }

    public void sendThesisClosedEmail(User deletingUser, Thesis thesis) {
        MailBuilder builder = new MailBuilder(config, "Thesis Closed", "thesis-closed");
        builder
                .sendToThesisStudents(thesis)
                .addDefaultBccRecipients()
                .fillThesisPlaceholders(thesis)
                .fillUserPlaceholders(deletingUser, "deletingUser")
                .send(javaMailSender, uploadService);
    }

    public void sendProposalUploadedEmail(ThesisProposal proposal) {
        MailBuilder builder = new MailBuilder(config, "Thesis Proposal Added", "thesis-proposal-uploaded");
        builder
                .addPrimarySender(proposal.getCreatedBy())
                .sendToThesisAdvisors(proposal.getThesis())
                .fillThesisProposalPlaceholders(proposal)
                .addAttachmentFile(proposal.getProposalFilename())
                .send(javaMailSender, uploadService);
    }

    public void sendProposalAcceptedEmail(ThesisProposal proposal) {
        MailBuilder builder = new MailBuilder(config, "Thesis Proposal Accepted", "thesis-proposal-accepted");
        builder
                .addPrimarySender(proposal.getApprovedBy())
                .sendToThesisStudents(proposal.getThesis())
                .fillThesisPlaceholders(proposal.getThesis())
                .fillThesisProposalPlaceholders(proposal)
                .send(javaMailSender, uploadService);
    }

    public void sendNewCommentEmail(ThesisComment comment) {
        MailBuilder builder = new MailBuilder(config, "New Thesis Comment", "thesis-comment-posted");

        if (comment.getType() == ThesisCommentType.ADVISOR) {
            builder.sendToThesisAdvisors(comment.getThesis());
        } else {
            builder.sendToThesisStudents(comment.getThesis());
        }

        builder
                .addPrimarySender(comment.getCreatedBy())
                .fillThesisCommentPlaceholders(comment)
                .addAttachmentFile(comment.getFilename())
                .send(javaMailSender, uploadService);
    }

    public void sendNewScheduledPresentationEmail(ThesisPresentation presentation) {
        MailBuilder builder = new MailBuilder(config, "New Presentation scheduled", "thesis-presentation-scheduled");
        builder
                .addPrimarySender(presentation.getCreatedBy())
                .sendToThesisStudents(presentation.getThesis())
                .addDefaultBccRecipients()
                .fillThesisPresentationPlaceholders(presentation)
                .send(javaMailSender, uploadService);
    }

    public void sendPresentationDeletedEmail(User deletingUser, ThesisPresentation presentation) {
        MailBuilder builder = new MailBuilder(config, "Presentation deleted", "thesis-presentation-deleted");
        builder
                .sendToThesisStudents(presentation.getThesis())
                .addDefaultBccRecipients()
                .fillThesisPresentationPlaceholders(presentation)
                .fillUserPlaceholders(deletingUser, "deletingUser")
                .send(javaMailSender, uploadService);
    }

    public void sendPresentationInvitation(ThesisPresentation presentation, String icsFile) {
        MailBuilder builder = new MailBuilder(config, "Thesis Presentation Invitation", "thesis-presentation-invitation");
        builder
                .sendToChairMembers()
                .sendToChairStudents()
                .fillThesisPresentationPlaceholders(presentation);

        for (ThesisRole role : presentation.getThesis().getRoles()) {
            builder.addPrimarySender(role.getUser());
        }

        if (icsFile != null && !icsFile.isBlank()) {
            builder.addRawAttatchment(
                    "event.ics",
                    new ByteArrayDataSource(icsFile.getBytes(StandardCharsets.UTF_8), "application/octet-stream")
            );
        }

        builder.send(javaMailSender, uploadService);
    }

    public void sendFinalSubmissionEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(config, "Thesis Submitted", "thesis-final-submission");
        builder
                .sendToThesisAdvisors(thesis)
                .addDefaultBccRecipients()
                .fillThesisPlaceholders(thesis)
                .addAttachmentFile(thesis.getFinalThesisFilename())
                .addAttachmentFile(thesis.getFinalPresentationFilename())
                .send(javaMailSender, uploadService);
    }

    public void sendAssessmentAddedEmail(ThesisAssessment assessment) {
        MailBuilder builder = new MailBuilder(config, "Assessment added", "thesis-assessment-added");
        builder
                .addPrimarySender(assessment.getCreatedBy())
                .sendToThesisSupervisors(assessment.getThesis())
                .fillThesisAssessmentPlaceholders(assessment)
                .send(javaMailSender, uploadService);
    }

    public void sendFinalGradeEmail(Thesis thesis) {
        MailBuilder builder = new MailBuilder(config, "Final Grade available for Thesis", "thesis-final-grade");
        builder
                .sendToThesisStudents(thesis)
                .addDefaultBccRecipients()
                .fillThesisPlaceholders(thesis)
                .send(javaMailSender, uploadService);
    }
}
