package thesistrack.ls1.service;

import org.hibernate.SessionFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import thesistrack.ls1.entity.Topic;
import thesistrack.ls1.entity.TopicRole;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.mock.EntityMockFactory;
import thesistrack.ls1.repository.TopicRepository;
import thesistrack.ls1.repository.TopicRoleRepository;
import thesistrack.ls1.repository.UserRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopicServiceTest {
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private TopicRoleRepository topicRoleRepository;
    @Mock
    private UserRepository userRepository;

    private TopicService topicService;
    private User testUser;
    private Topic testTopic;

    @BeforeEach
    void setUp() {
        topicService = new TopicService(
                topicRepository,
                topicRoleRepository,
                userRepository
        );

        testUser = EntityMockFactory.createUserWithGroup("Test", "supervisor");
        testTopic = EntityMockFactory.createTopic("Test Topic");
    }

    @Test
    void getAll_ReturnsPageOfTopics() {
        List<Topic> topics = List.of(testTopic);
        Page<Topic> expectedPage = new PageImpl<>(topics);
        when(topicRepository.searchTopics(
                any(),
                anyBoolean(),
                any(),
                any(PageRequest.class)
        )).thenReturn(expectedPage);

        Page<Topic> result = topicService.getAll(
                null,
                true,
                null,
                0,
                10,
                "title",
                "asc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(topicRepository).searchTopics(
                eq(null),
                eq(true),
                eq(null),
                eq(PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "title")))
        );
    }

    @Test
    void createTopic_WithValidData_CreatesTopic() {
        List<UUID> supervisorIds = List.of(UUID.randomUUID());
        List<UUID> advisorIds = List.of(UUID.randomUUID());

        User supervisor = EntityMockFactory.createUserWithGroup("Supervisor", "supervisor");
        User advisor = EntityMockFactory.createUserWithGroup("Advisor", "advisor");

        when(userRepository.findAllById(supervisorIds)).thenReturn(new ArrayList<>(List.of(supervisor)));
        when(userRepository.findAllById(advisorIds)).thenReturn(new ArrayList<>(List.of(advisor)));
        when(topicRepository.save(any(Topic.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Topic result = topicService.createTopic(
                testUser,
                "Test Topic",
                Set.of("Bachelor"),
                "Problem Statement",
                "Requirements",
                "Goals",
                "References",
                supervisorIds,
                advisorIds
        );

        assertNotNull(result);
        verify(topicRepository, times(2)).save(any(Topic.class));
        verify(topicRoleRepository, times(2)).save(any(TopicRole.class));
    }

    @Test
    void createTopic_WithInvalidSupervisor_ThrowsException() {
        User invalidSupervisor = EntityMockFactory.createUserWithGroup("Student", "student");
        User advisor = EntityMockFactory.createUserWithGroup("Advisor", "advisor");

        List<UUID> supervisorIds = new ArrayList<>(List.of(invalidSupervisor.getId()));
        List<UUID> advisorIds = new ArrayList<>(List.of(advisor.getId()));

        when(userRepository.findAllById(supervisorIds)).thenReturn(new ArrayList<>(List.of(invalidSupervisor)));
        when(userRepository.findAllById(advisorIds)).thenReturn(new ArrayList<>(List.of(advisor)));
        when(topicRepository.save(any(Topic.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(ResourceInvalidParametersException.class, () ->
                topicService.createTopic(
                        testUser,
                        "Test Topic",
                        Set.of("Bachelor"),
                        "Problem Statement",
                        "Requirements",
                        "Goals",
                        "References",
                        supervisorIds,
                        advisorIds
                )
        );
    }

    @Test
    void updateTopic_WithValidData_UpdatesTopic() {
        User supervisor = EntityMockFactory.createUserWithGroup("Supervisor", "supervisor");
        User advisor = EntityMockFactory.createUserWithGroup("Advisor", "advisor");

        List<UUID> supervisorIds = new ArrayList<>(List.of(supervisor.getId()));
        List<UUID> advisorIds = new ArrayList<>(List.of(advisor.getId()));

        when(userRepository.findAllById(supervisorIds)).thenReturn(new ArrayList<>(List.of(supervisor)));
        when(userRepository.findAllById(advisorIds)).thenReturn(new ArrayList<>(List.of(advisor)));
        when(topicRepository.save(any(Topic.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Topic result = topicService.updateTopic(
                testUser,
                testTopic,
                "Updated Topic",
                Set.of("Master"),
                "Updated Problem",
                "Updated Requirements",
                "Updated Goals",
                "Updated References",
                supervisorIds,
                advisorIds
        );

        assertNotNull(result);
        assertEquals("Updated Topic", result.getTitle());
        verify(topicRoleRepository).deleteByTopicId(testTopic.getId());
        verify(topicRepository).save(testTopic);
    }

    @Test
    void findById_WithValidId_ReturnsTopic() {
        when(topicRepository.findById(testTopic.getId())).thenReturn(Optional.of(testTopic));

        Topic result = topicService.findById(testTopic.getId());

        assertNotNull(result);
        assertEquals(testTopic, result);
    }

    @Test
    void findById_WithInvalidId_ThrowsException() {
        when(topicRepository.findById(testTopic.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                topicService.findById(testTopic.getId())
        );
    }
}