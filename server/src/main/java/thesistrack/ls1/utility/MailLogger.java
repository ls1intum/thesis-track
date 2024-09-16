package thesistrack.ls1.utility;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;

import java.io.IOException;

public class MailLogger {
    public static String getTextFromMimeMessage(MimeMessage message) {
        StringBuilder builder = new StringBuilder();
        
        try {
            builder.append("Subject: ").append(message.getSubject()).append("\n");
            builder.append("From: ").append(message.getFrom()[0].toString()).append("\n");
            builder.append("To: ").append(message.getRecipients(Message.RecipientType.TO)[0].toString()).append("\n");

            Object content = message.getContent();
            if (content instanceof String) {
                builder.append("Content: ").append(content).append("\n");
            } else if (content instanceof MimeMultipart mimeMultipart) {
                builder.append("Content: ").append(getTextFromMimeMultipart(mimeMultipart)).append("\n");
            }
        } catch (MessagingException | IOException ignored) { }

        return builder.toString();
    }

    private static String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws MessagingException, IOException {
        StringBuilder result = new StringBuilder();
        int count = mimeMultipart.getCount();
        
        for (int i = 0; i < count; i++) {
            var bodyPart = mimeMultipart.getBodyPart(i);
            
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            } else if (bodyPart.isMimeType("text/html")) {
                result.append(bodyPart.getContent());
            } else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart) bodyPart.getContent()));
            }
        }
        
        return result.toString();
    }
}