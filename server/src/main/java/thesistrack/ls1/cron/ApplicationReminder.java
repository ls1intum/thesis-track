package thesistrack.ls1.cron;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import thesistrack.ls1.repository.ApplicationRepository;
import thesistrack.ls1.service.MailingService;

import java.time.Instant;

@Component
public class ApplicationReminder {
    private static final Logger log = LoggerFactory.getLogger(ApplicationReminder.class);
    private final ApplicationRepository applicationRepository;
    private final MailingService mailingService;

    public ApplicationReminder(ApplicationRepository applicationRepository, MailingService mailingService) {
        this.applicationRepository = applicationRepository;
        this.mailingService = mailingService;
    }

    @Scheduled(cron = "0 0 10 * * WED")
    public void emailReminder() {
        long unreviewedApplications = applicationRepository.countUnreviewedApplications(null);

        if (unreviewedApplications > 10) {
            mailingService.sendApplicationReminderEmail(unreviewedApplications);
        }

        log.info("Scheduled task executed at {}", Instant.now());
    }
}
