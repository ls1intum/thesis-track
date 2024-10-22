package thesistrack.ls1.service;

import jakarta.mail.internet.InternetAddress;
import net.fortuna.ical4j.model.Calendar;
import net.fortuna.ical4j.model.property.ProdId;
import net.fortuna.ical4j.model.property.immutable.ImmutableCalScale;
import net.fortuna.ical4j.model.property.immutable.ImmutableMethod;
import net.fortuna.ical4j.model.property.immutable.ImmutableVersion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.constants.ThesisPresentationState;
import thesistrack.ls1.constants.ThesisPresentationType;
import thesistrack.ls1.constants.ThesisPresentationVisibility;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.entity.key.ThesisPresentationInviteId;
import thesistrack.ls1.exception.request.AccessDeniedException;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.ThesisPresentationInviteRepository;
import thesistrack.ls1.repository.ThesisPresentationRepository;
import thesistrack.ls1.repository.ThesisRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ThesisPresentationService {
    private final CalendarService calendarService;
    private final ThesisRepository thesisRepository;
    private final MailingService mailingService;
    private final ThesisPresentationRepository thesisPresentationRepository;

    private final String clientHost;
    private final InternetAddress applicationMail;
    private final UserRepository userRepository;
    private final ThesisPresentationInviteRepository thesisPresentationInviteRepository;

    @Autowired
    public ThesisPresentationService(
            CalendarService calendarService,
            ThesisRepository thesisRepository,
            MailingService mailingService,
            ThesisPresentationRepository thesisPresentationRepository,
            @Value("${thesis-track.client.host}") String clientHost,
            @Value("${thesis-track.mail.sender}") InternetAddress applicationMail,
            UserRepository userRepository, ThesisPresentationInviteRepository thesisPresentationInviteRepository) {
        this.calendarService = calendarService;
        this.thesisRepository = thesisRepository;
        this.mailingService = mailingService;
        this.thesisPresentationRepository = thesisPresentationRepository;

        this.clientHost = clientHost;
        this.applicationMail = applicationMail;
        this.userRepository = userRepository;
        this.thesisPresentationInviteRepository = thesisPresentationInviteRepository;
    }

    public Page<ThesisPresentation> getPublicPresentations(Boolean includeDrafts, Integer page, Integer limit, String sortBy, String sortOrder) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        return thesisPresentationRepository.findFuturePresentations(
                Instant.now(),
                includeDrafts ? Set.of(ThesisPresentationState.DRAFTED, ThesisPresentationState.SCHEDULED) : Set.of(ThesisPresentationState.SCHEDULED),
                Set.of(ThesisPresentationVisibility.PUBLIC),
                PageRequest.of(page, limit, Sort.by(order))
        );
    }

    public ThesisPresentation getPublicPresentation(UUID presentationId) {
        ThesisPresentation presentation =  thesisPresentationRepository.findById(presentationId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Presentation with id %s not found.", presentationId)));

        if (presentation.getVisibility() != ThesisPresentationVisibility.PUBLIC) {
            throw new AccessDeniedException("Presentation is not public");
        }

        return presentation;
    }

    public Calendar getPresentationCalendar() {
        Calendar calendar = createEmptyCalendar();

        calendar.add(ImmutableMethod.PUBLISH);

        List<ThesisPresentation> presentations = thesisPresentationRepository.findAllPresentations(
                Set.of(ThesisPresentationVisibility.PUBLIC)
        );

        for (ThesisPresentation presentation : presentations) {
            calendar.add(calendarService.createVEvent(presentation.getId().toString(), createPresentationCalendarEvent(presentation)));
        }

        return calendar;
    }

    public Calendar getPresentationInvite(ThesisPresentation presentation) {
        Calendar calendar = createEmptyCalendar();

        calendar.add(ImmutableMethod.REQUEST);

        calendar.add(calendarService.createVEvent(presentation.getId().toString(), createPresentationCalendarEvent(presentation)));

        return calendar;
    }

    @Transactional
    public Thesis createPresentation(
            User creatingUser,
            Thesis thesis,
            ThesisPresentationType type,
            ThesisPresentationVisibility visibility,
            String location,
            String streamUrl,
            String language,
            Instant date
    ) {
        ThesisPresentation presentation = new ThesisPresentation();

        presentation.setThesis(thesis);
        presentation.setState(ThesisPresentationState.DRAFTED);
        presentation.setType(type);
        presentation.setVisibility(visibility);
        presentation.setLocation(location);
        presentation.setStreamUrl(streamUrl);
        presentation.setLanguage(language);
        presentation.setScheduledAt(date);
        presentation.setCreatedBy(creatingUser);
        presentation.setCreatedAt(Instant.now());

        presentation = thesisPresentationRepository.save(presentation);

        List<ThesisPresentation> presentations = thesis.getPresentations();
        presentations.add(presentation);
        presentations.sort(Comparator.comparing(ThesisPresentation::getScheduledAt));
        thesis.setPresentations(presentations);

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis updatePresentation(
            ThesisPresentation presentation,
            ThesisPresentationType type,
            ThesisPresentationVisibility visibility,
            String location,
            String streamUrl,
            String language,
            Instant date
    ) {
        Thesis thesis = presentation.getThesis();
        presentation = thesis.getPresentation(presentation.getId()).orElseThrow();

        presentation.setType(type);
        presentation.setVisibility(visibility);
        presentation.setLocation(location);
        presentation.setStreamUrl(streamUrl);
        presentation.setLanguage(language);
        presentation.setScheduledAt(date);

        thesisPresentationRepository.save(presentation);

        if (presentation.getState() == ThesisPresentationState.SCHEDULED) {
            mailingService.sendScheduledPresentationEmail("UPDATED", presentation, getPresentationInvite(presentation).toString());
        }

        updateThesisCalendarEvents(thesis);

        return thesis;
    }

    @Transactional
    public Thesis schedulePresentation(
            ThesisPresentation presentation,
            boolean inviteChairMembers,
            boolean inviteThesisStudents,
            List<InternetAddress> additionalInvites
    ) {
        Thesis thesis = presentation.getThesis();
        presentation = thesis.getPresentation(presentation.getId()).orElseThrow();

        if (presentation.getState() == ThesisPresentationState.SCHEDULED) {
            throw new ResourceInvalidParametersException("Presentation is already scheduled");
        }

        presentation.setState(ThesisPresentationState.SCHEDULED);

        calendarService.deleteEvent(presentation.getCalendarEvent());

        if (presentation.getVisibility().equals(ThesisPresentationVisibility.PUBLIC)) {
            presentation.setCalendarEvent(calendarService.createEvent(createPresentationCalendarEvent(presentation)));
        }

        presentation = thesisPresentationRepository.save(presentation);

        Set<InternetAddress> addresses = new HashSet<>();

        for (ThesisRole role : presentation.getThesis().getRoles()) {
            addresses.add(role.getUser().getEmail());
        }

        if (inviteChairMembers) {
            for (User user : userRepository.getRoleMembers(Set.of("admin", "supervisor", "advisor"))) {
                if (!user.isNotificationEnabled("presentation-invitations")) {
                    continue;
                }

                addresses.add(user.getEmail());
            }
        }

        if (inviteThesisStudents) {
            for (User user : userRepository.getRoleMembers(Set.of("student"))) {
                if (!user.isNotificationEnabled("presentation-invitations")) {
                    continue;
                }

                addresses.add(user.getEmail());
            }
        }

        addresses.addAll(additionalInvites);

        List<ThesisPresentationInvite> invites = new ArrayList<>();

        for (InternetAddress address : addresses) {
            ThesisPresentationInviteId entityId = new ThesisPresentationInviteId();
            entityId.setPresentationId(presentation.getId());
            entityId.setEmail(address.toString());

            ThesisPresentationInvite entity = new ThesisPresentationInvite();
            entity.setPresentation(presentation);
            entity.setId(entityId);
            entity.setInvitedAt(Instant.now());

            invites.add(thesisPresentationInviteRepository.save(entity));
        }

        presentation.setInvites(invites);
        presentation = thesisPresentationRepository.save(presentation);

        mailingService.sendScheduledPresentationEmail("CREATED", presentation, getPresentationInvite(presentation).toString());

        return thesis;
    }

    @Transactional
    public Thesis deletePresentation(User deletingUser, ThesisPresentation presentation) {
        Thesis thesis = presentation.getThesis();

        thesisPresentationInviteRepository.deleteByPresentationId(presentation.getId());
        thesisPresentationRepository.deleteById(presentation.getId());

        List<ThesisPresentation> presentations = new ArrayList<>(thesis.getPresentations().stream()
                .filter(x -> !presentation.getId().equals(x.getId()))
                .toList());

        thesis.setPresentations(presentations);

        thesis = thesisRepository.save(thesis);

        calendarService.deleteEvent(presentation.getCalendarEvent());

        if (presentation.getState() == ThesisPresentationState.SCHEDULED) {
            mailingService.sendPresentationDeletedEmail(deletingUser, presentation);
        }

        return thesis;
    }

    public void updateThesisCalendarEvents(Thesis thesis) {
        for (ThesisPresentation presentation : thesis.getPresentations()) {
            String eventId = presentation.getCalendarEvent();

            if (eventId != null) {
                calendarService.updateEvent(eventId, createPresentationCalendarEvent(presentation));
            }
        }
    }

    public ThesisPresentation findById(UUID thesisId, UUID presentationId) {
        ThesisPresentation presentation = thesisPresentationRepository.findById(presentationId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Presentation with id %s not found.", presentationId)));

        if (!presentation.getThesis().getId().equals(thesisId)) {
            throw new ResourceNotFoundException(String.format("Presentation with id %s not found for thesis with id %s.", presentationId, thesisId));
        }

        return presentation;
    }

    private Calendar createEmptyCalendar() {
        Calendar calendar = new Calendar();

        calendar.add(new ProdId("-//Thesis Track//Thesis Presentations//EN"));
        calendar.add(ImmutableVersion.VERSION_2_0);
        calendar.add(ImmutableCalScale.GREGORIAN);

        return calendar;
    }

    private CalendarService.CalendarEvent createPresentationCalendarEvent(ThesisPresentation presentation) {
        String location = presentation.getLocation();
        String streamUrl = presentation.getStreamUrl();

        return new CalendarService.CalendarEvent(
                "Thesis Presentation \"" + presentation.getThesis().getTitle() + "\"",
                location == null || location.isBlank() ? streamUrl : location,
                "Title: " + presentation.getThesis().getTitle() + "\n" +
                        (streamUrl != null && !streamUrl.isBlank() ? "Stream URL: " + streamUrl + "\n" : "") + "\n" +
                        "Language: " + presentation.getLanguage() + "\n\n" +
                        "Details: " + clientHost + "/presentations/" + presentation.getId() + "\n\n" +
                        "Abstract:\n" + presentation.getThesis().getAbstractField(),
                presentation.getScheduledAt(),
                presentation.getScheduledAt().plus(45, ChronoUnit.MINUTES),
                this.applicationMail,
                presentation.getThesis().getRoles().stream().map((role) -> role.getUser().getEmail()).toList(),
                presentation.getInvites().stream().map(ThesisPresentationInvite::getEmail).toList()
        );
    }
}
