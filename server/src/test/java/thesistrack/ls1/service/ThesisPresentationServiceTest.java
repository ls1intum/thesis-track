package thesistrack.ls1.service;

import jakarta.mail.internet.InternetAddress;
import net.fortuna.ical4j.model.Calendar;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import thesistrack.ls1.constants.ThesisPresentationState;
import thesistrack.ls1.constants.ThesisPresentationType;
import thesistrack.ls1.constants.ThesisPresentationVisibility;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.exception.request.AccessDeniedException;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.mock.EntityMockFactory;
import thesistrack.ls1.repository.ThesisPresentationInviteRepository;
import thesistrack.ls1.repository.ThesisPresentationRepository;
import thesistrack.ls1.repository.ThesisRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThesisPresentationServiceTest {
    @Mock private CalendarService calendarService;
    @Mock private ThesisRepository thesisRepository;
    @Mock private MailingService mailingService;
    @Mock private ThesisPresentationRepository thesisPresentationRepository;
    @Mock private UserRepository userRepository;
    @Mock private ThesisPresentationInviteRepository thesisPresentationInviteRepository;

    private ThesisPresentationService presentationService;
    private User testUser;
    private Thesis testThesis;
    private ThesisPresentation testPresentation;

    @BeforeEach
    void setUp() throws Exception {
        InternetAddress applicationMail = new InternetAddress("test@example.com");
        String clientHost = "http://example.com";
        presentationService = new ThesisPresentationService(
                calendarService,
                thesisRepository,
                mailingService,
                thesisPresentationRepository,
                clientHost,
                applicationMail,
                userRepository,
                thesisPresentationInviteRepository
        );

        testUser = EntityMockFactory.createUser("Test");

        testThesis = EntityMockFactory.createThesis("Test Thesis");

        testPresentation = new ThesisPresentation();
        testPresentation.setId(UUID.randomUUID());
        testPresentation.setThesis(testThesis);
        testPresentation.setState(ThesisPresentationState.DRAFTED);
        testPresentation.setType(ThesisPresentationType.FINAL);
        testPresentation.setVisibility(ThesisPresentationVisibility.PRIVATE);
        testPresentation.setScheduledAt(Instant.now().plusSeconds(3600));
        testPresentation.setLocation("Location");
        testPresentation.setStreamUrl("https://stream.url");
        testPresentation.setLanguage("English");
        testPresentation.setCreatedBy(testUser);
        testPresentation.setCreatedAt(Instant.now());

        testThesis.setPresentations(new ArrayList<>(List.of(testPresentation)));
    }

    @Test
    void getPublicPresentations_ReturnsPageOfPresentations() {
        Page<ThesisPresentation> expectedPage = new PageImpl<>(List.of(testPresentation));
        when(thesisPresentationRepository.findFuturePresentations(
                any(Instant.class),
                anySet(),
                anySet(),
                any(PageRequest.class)
        )).thenReturn(expectedPage);

        Page<ThesisPresentation> result = presentationService.getPublicPresentations(
                true,
                0,
                10,
                "scheduledAt",
                "asc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testPresentation, result.getContent().getFirst());
        verify(thesisPresentationRepository).findFuturePresentations(
                any(Instant.class),
                eq(Set.of(ThesisPresentationState.SCHEDULED, ThesisPresentationState.DRAFTED)),
                eq(Set.of(ThesisPresentationVisibility.PUBLIC)),
                any(PageRequest.class)
        );
    }

    @Test
    void getPublicPresentation_WithPublicPresentation_ReturnsPresentation() {
        testPresentation.setVisibility(ThesisPresentationVisibility.PUBLIC);
        when(thesisPresentationRepository.findById(testPresentation.getId()))
                .thenReturn(Optional.of(testPresentation));

        ThesisPresentation result = presentationService.getPublicPresentation(testPresentation.getId());

        assertNotNull(result);
        assertEquals(testPresentation.getId(), result.getId());
        verify(thesisPresentationRepository).findById(testPresentation.getId());
    }

    @Test
    void getPublicPresentation_WithPrivatePresentation_ThrowsException() {
        when(thesisPresentationRepository.findById(testPresentation.getId()))
                .thenReturn(Optional.of(testPresentation));

        assertThrows(AccessDeniedException.class, () ->
                presentationService.getPublicPresentation(testPresentation.getId())
        );
        verify(thesisPresentationRepository).findById(testPresentation.getId());
    }

    @Test
    void createPresentation_WithValidData_CreatesPresentation() {
        when(thesisPresentationRepository.save(any(ThesisPresentation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(thesisRepository.save(any(Thesis.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = presentationService.createPresentation(
                testUser,
                testThesis,
                ThesisPresentationType.FINAL,
                ThesisPresentationVisibility.PRIVATE,
                "Room 101",
                "http://example.com/meeting",
                "English",
                Instant.now().plusSeconds(1800)
        );

        assertNotNull(result);
        assertEquals(2, result.getPresentations().size());
        assertEquals(testPresentation, result.getPresentations().getLast());
        verify(thesisPresentationRepository).save(any(ThesisPresentation.class));
        verify(thesisRepository).save(testThesis);
    }

    @Test
    void schedulePresentation_WithAlreadyScheduledPresentation_ThrowsException() {
        testPresentation.setState(ThesisPresentationState.SCHEDULED);
        testThesis.setPresentations(List.of(testPresentation));

        assertThrows(ResourceInvalidParametersException.class, () ->
                presentationService.schedulePresentation(
                        testPresentation,
                        true,
                        true,
                        List.of(new InternetAddress("invite@example.com"))
                )
        );
    }

    @Test
    void deletePresentation_WithScheduledPresentation_DeletesAndNotifies() {
        testPresentation.setState(ThesisPresentationState.SCHEDULED);
        testThesis.setPresentations(List.of(testPresentation));
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = presentationService.deletePresentation(testUser, testPresentation);

        assertNotNull(result);
        assertTrue(result.getPresentations().isEmpty());
        verify(thesisPresentationInviteRepository).deleteByPresentationId(testPresentation.getId());
        verify(thesisPresentationRepository).deleteById(testPresentation.getId());
        verify(mailingService).sendPresentationDeletedEmail(testUser, testPresentation);
        verify(thesisRepository).save(testThesis);
    }

    @Test
    void updatePresentation_WithScheduledPresentation_UpdatesAndNotifies() {
        when(thesisPresentationRepository.save(any(ThesisPresentation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = presentationService.updatePresentation(
                testPresentation,
                ThesisPresentationType.FINAL,
                ThesisPresentationVisibility.PRIVATE,
                "Updated Room",
                "http://example.com/updated",
                "German",
                Instant.now().plusSeconds(7200)
        );

        assertNotNull(result);
        verify(thesisPresentationRepository).save(testPresentation);
    }

    @Test
    void findById_WithInvalidThesisId_ThrowsException() {
        UUID differentThesisId = UUID.randomUUID();
        when(thesisPresentationRepository.findById(testPresentation.getId()))
                .thenReturn(Optional.of(testPresentation));

        assertThrows(ResourceNotFoundException.class, () ->
                presentationService.findById(differentThesisId, testPresentation.getId())
        );
        verify(thesisPresentationRepository).findById(testPresentation.getId());
    }

    @Test
    void getPresentationCalendar_ReturnsCalendarWithEvents() {
        when(thesisPresentationRepository.findAllPresentations(anySet()))
                .thenReturn(List.of(testPresentation));
        when(calendarService.createVEvent(anyString(), any()))
                .thenReturn(null);

        Calendar result = presentationService.getPresentationCalendar();

        assertNotNull(result);
        verify(calendarService).createVEvent(anyString(), any());
        verify(thesisPresentationRepository).findAllPresentations(anySet());
    }
}