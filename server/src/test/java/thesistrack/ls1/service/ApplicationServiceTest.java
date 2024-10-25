package thesistrack.ls1.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import thesistrack.ls1.constants.ApplicationRejectReason;
import thesistrack.ls1.constants.ApplicationReviewReason;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.entity.key.ApplicationReviewerId;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.mock.EntityMockFactory;
import thesistrack.ls1.repository.ApplicationRepository;
import thesistrack.ls1.repository.ApplicationReviewerRepository;
import thesistrack.ls1.repository.TopicRepository;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private MailingService mailingService;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private ThesisService thesisService;
    @Mock
    private TopicService topicService;
    @Mock
    private ApplicationReviewerRepository applicationReviewerRepository;

    private ApplicationService applicationService;
    private User testUser;
    private Topic testTopic;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        applicationService = new ApplicationService(
                applicationRepository,
                mailingService,
                topicRepository,
                thesisService,
                topicService,
                applicationReviewerRepository
        );

        testUser = EntityMockFactory.createUser("Test");
        testTopic = EntityMockFactory.createTopic("Test Topic");
        testApplication = EntityMockFactory.createApplication();
    }

    @Test
    void getAll_WithValidParameters_ReturnsPageOfApplications() {
        Page<Application> expectedPage = new PageImpl<>(List.of(testApplication));
        when(applicationRepository.searchApplications(
                any(), any(), any(), any(), any(), any(), any(), anyBoolean(), any(PageRequest.class)
        )).thenReturn(expectedPage);

        Page<Application> result = applicationService.getAll(
                null,
                null,
                null,
                new ApplicationState[]{ApplicationState.NOT_ASSESSED},
                null,
                null,
                null,
                true,
                0,
                10,
                "createdAt",
                "desc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(applicationRepository).searchApplications(
                any(), any(), any(), any(), any(), any(), any(), anyBoolean(), any(PageRequest.class)
        );
    }

    @Test
    void createApplication_WithValidData_CreatesApplication() {
        when(topicService.findById(testTopic.getId())).thenReturn(testTopic);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        Application result = applicationService.createApplication(
                testUser,
                testTopic.getId(),
                "Test Thesis",
                "Bachelor",
                Instant.now(),
                "Test motivation"
        );

        assertNotNull(result);
        verify(applicationRepository).save(any(Application.class));
        verify(mailingService).sendApplicationCreatedEmail(any(Application.class));
    }

    @Test
    void createApplication_WithClosedTopic_ThrowsException() {
        testTopic.setClosedAt(Instant.now());
        when(topicService.findById(testTopic.getId())).thenReturn(testTopic);

        assertThrows(ResourceInvalidParametersException.class, () ->
                applicationService.createApplication(
                        testUser,
                        testTopic.getId(),
                        "Test Thesis",
                        "Bachelor",
                        Instant.now(),
                        "Test motivation"
                )
        );
    }

    @Test
    void accept_WithValidData_AcceptsApplicationAndCreatesThesis() {
        User reviewer = new User();
        reviewer.setId(UUID.randomUUID());
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        when(thesisService.createThesis(any(), any(), any(), any(), any(), any(), any(), anyBoolean()))
                .thenReturn(EntityMockFactory.createThesis("Test Thesis"));

        List<Application> results = applicationService.accept(
                reviewer,
                testApplication,
                "Test Thesis",
                "Bachelor",
                List.of(UUID.randomUUID()),
                List.of(UUID.randomUUID()),
                true,
                false
        );

        assertFalse(results.isEmpty());
        assertEquals(ApplicationState.ACCEPTED, results.getFirst().getState());
        verify(thesisService).createThesis(any(), any(), any(), any(), any(), any(), any(), anyBoolean());
        verify(mailingService).sendApplicationAcceptanceEmail(any(), any());
    }

    @Test
    void reject_WithValidData_RejectsApplication() {
        User reviewer = EntityMockFactory.createUser("Reviewer");
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        List<Application> results = applicationService.reject(
                reviewer,
                testApplication,
                ApplicationRejectReason.TOPIC_FILLED,
                true
        );

        assertFalse(results.isEmpty());
        assertEquals(ApplicationState.REJECTED, results.getFirst().getState());
        verify(mailingService).sendApplicationRejectionEmail(any(), any());
    }

    @Test
    void reviewApplication_WithNewReviewer_CreatesReview() {
        User reviewer = new User();
        reviewer.setId(UUID.randomUUID());
        ApplicationReviewer applicationReviewer = new ApplicationReviewer();
        applicationReviewer.setId(new ApplicationReviewerId());
        when(applicationReviewerRepository.save(any(ApplicationReviewer.class))).thenReturn(applicationReviewer);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        Application result = applicationService.reviewApplication(
                testApplication,
                reviewer,
                ApplicationReviewReason.INTERESTED
        );

        assertNotNull(result);
        verify(applicationReviewerRepository).save(any(ApplicationReviewer.class));
    }

    @Test
    void closeTopic_WithValidData_ClosesTopicAndRejectsApplications() {
        User closer = new User();
        closer.setId(UUID.randomUUID());
        List<Application> apllicationList = Arrays.asList(testApplication);
        when(applicationRepository.findAllByTopic(testTopic)).thenReturn(apllicationList);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        when(topicRepository.save(any(Topic.class))).thenReturn(testTopic);

        Topic result = applicationService.closeTopic(
                closer,
                testTopic,
                ApplicationRejectReason.TOPIC_FILLED,
                true
        );

        assertNotNull(result);
        assertNotNull(result.getClosedAt());
        verify(topicRepository).save(testTopic);
        verify(applicationRepository).findAllByTopic(testTopic);
    }

    @Test
    void applicationExists_WithExistingApplication_ReturnsTrue() {
        UUID topicId = UUID.randomUUID();
        when(applicationRepository.existsPendingApplication(testUser.getId(), topicId)).thenReturn(true);

        boolean result = applicationService.applicationExists(testUser, topicId);

        assertTrue(result);
    }

    @Test
    void findById_WithValidId_ReturnsApplication() {
        when(applicationRepository.findById(testApplication.getId())).thenReturn(Optional.of(testApplication));

        Application result = applicationService.findById(testApplication.getId());

        assertNotNull(result);
        assertEquals(testApplication, result);
    }

    @Test
    void findById_WithInvalidId_ThrowsException() {
        UUID applicationId = UUID.randomUUID();
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                applicationService.findById(applicationId)
        );
    }

    @Test
    void updateApplication_WithValidData_UpdatesApplication() {
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        when(topicService.findById(any())).thenReturn(testTopic);

        Application result = applicationService.updateApplication(
                testApplication,
                UUID.randomUUID(),
                "Updated Title",
                "Master",
                Instant.now(),
                "Updated motivation"
        );

        assertNotNull(result);
        assertEquals(result.getThesisTitle(), "Updated Title");
        verify(applicationRepository).save(any(Application.class));
    }
}