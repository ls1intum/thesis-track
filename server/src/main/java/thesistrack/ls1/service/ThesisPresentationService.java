package thesistrack.ls1.service;

import net.fortuna.ical4j.model.Calendar;
import net.fortuna.ical4j.model.property.ProdId;
import net.fortuna.ical4j.model.property.immutable.ImmutableCalScale;
import net.fortuna.ical4j.model.property.immutable.ImmutableMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.constants.ThesisPresentationType;
import thesistrack.ls1.constants.ThesisPresentationVisibility;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisPresentation;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.ThesisPresentationRepository;
import thesistrack.ls1.repository.ThesisRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ThesisPresentationService {
    private final CalendarService calendarService;
    private final ThesisRepository thesisRepository;
    private final MailingService mailingService;
    private final ThesisPresentationRepository thesisPresentationRepository;

    @Autowired
    public ThesisPresentationService(CalendarService calendarService, ThesisRepository thesisRepository, MailingService mailingService, ThesisPresentationRepository thesisPresentationRepository) {
        this.calendarService = calendarService;
        this.thesisRepository = thesisRepository;
        this.mailingService = mailingService;
        this.thesisPresentationRepository = thesisPresentationRepository;
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

    public Calendar getPresentationEvent(ThesisPresentation presentation) {
        Calendar calendar = createEmptyCalendar();

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
        presentation.setType(type);
        presentation.setVisibility(visibility);
        presentation.setLocation(location);
        presentation.setStreamUrl(streamUrl);
        presentation.setLanguage(language);
        presentation.setScheduledAt(date);
        presentation.setCreatedBy(creatingUser);
        presentation.setCreatedAt(Instant.now());

        presentation = thesisPresentationRepository.save(presentation);

        if (visibility.equals(ThesisPresentationVisibility.PUBLIC)) {
            presentation.setCalendarEvent(calendarService.createEvent(createPresentationCalendarEvent(presentation)));
            presentation = thesisPresentationRepository.save(presentation);

            mailingService.sendPresentationInvitation(presentation, getPresentationEvent(presentation).toString());
        }

        List<ThesisPresentation> presentations = thesis.getPresentations();
        presentations.add(presentation);
        presentations.sort(Comparator.comparing(ThesisPresentation::getScheduledAt));
        thesis.setPresentations(presentations);

        thesis = thesisRepository.save(thesis);

        mailingService.sendNewScheduledPresentationEmail(presentation);

        return thesis;
    }

    @Transactional
    public Thesis deletePresentation(User deletingUser, ThesisPresentation presentation) {
        Thesis thesis = presentation.getThesis();

        thesisPresentationRepository.deleteById(presentation.getId());

        List<ThesisPresentation> presentations = new ArrayList<>(thesis.getPresentations().stream()
                .filter(x -> !presentation.getId().equals(x.getId()))
                .toList());

        thesis.setPresentations(presentations);

        thesis = thesisRepository.save(thesis);

        calendarService.deleteEvent(presentation.getCalendarEvent());
        mailingService.sendPresentationDeletedEmail(deletingUser, presentation);

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
                        "Language: " + presentation.getLanguage() + "\n" +
                        "Abstract:\n\n" + presentation.getThesis().getAbstractField(),
                presentation.getScheduledAt(),
                presentation.getScheduledAt().plus(60, ChronoUnit.MINUTES),
                presentation.getThesis().getSupervisors().getFirst().getEmail(),
                presentation.getThesis().getRoles().stream().map((role) -> role.getUser().getEmail()).toList()
        );
    }
}
