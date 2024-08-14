package thesistrack.ls1.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.entity.Topic;
import thesistrack.ls1.entity.TopicRole;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.entity.key.TopicRoleId;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.TopicRepository;
import thesistrack.ls1.repository.TopicRoleRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

@Service
public class TopicService {
    private final TopicRepository topicRepository;
    private final TopicRoleRepository topicRoleRepository;
    private final UserRepository userRepository;

    public TopicService(TopicRepository topicRepository, TopicRoleRepository topicRoleRepository, UserRepository userRepository) {
        this.topicRepository = topicRepository;
        this.topicRoleRepository = topicRoleRepository;
        this.userRepository = userRepository;
    }

    public Page<Topic> getAll(
            boolean includeClosed,
            String searchQuery,
            int page,
            int limit,
            String sortBy,
            String sortOrder
    ) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        String searchQueryFilter = searchQuery == null || searchQuery.isEmpty() ? null : searchQuery.toLowerCase();

        return topicRepository.searchTopics(
                includeClosed,
                searchQueryFilter,
                PageRequest.of(page, limit, Sort.by(order))
        );
    }

    @Transactional
    public Topic createTopic(
            User creator,
            String title,
            String problemStatement,
            String goals,
            String references,
            String requiredDegree,
            Set<UUID> supervisorIds,
            Set<UUID> advisorIds
    ) {
        Topic topic = new Topic();

        topic.setTitle(title);
        topic.setProblemStatement(problemStatement);
        topic.setGoals(goals);
        topic.setReferences(references);
        topic.setRequiredDegree(requiredDegree);
        topic.setUpdatedAt(Instant.now());
        topic.setCreatedAt(Instant.now());
        topic.setCreatedBy(creator);

        topic = topicRepository.save(topic);

        assignTopicRoles(topic, creator, advisorIds, supervisorIds);

        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateTopic(
            User updater,
            Topic topic,
            String title,
            String problemStatement,
            String goals,
            String references,
            String requiredDegree,
            Set<UUID> supervisorIds,
            Set<UUID> advisorIds
    ) {
        topic.setTitle(title);
        topic.setProblemStatement(problemStatement);
        topic.setGoals(goals);
        topic.setReferences(references);
        topic.setRequiredDegree(requiredDegree);
        topic.setUpdatedAt(Instant.now());

        assignTopicRoles(topic, updater, advisorIds, supervisorIds);

        return topicRepository.save(topic);
    }

    @Transactional
    public Topic closeTopic(Topic topic) {
        topic.setClosedAt(Instant.now());

        return topicRepository.save(topic);
    }

    public Topic findById(UUID topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Topic with id %s not found.", topicId)));
    }

    private void assignTopicRoles(Topic topic, User assigner, Set<UUID> advisorIds, Set<UUID> supervisorIds) {
        List<User> supervisors = userRepository.findAllById(supervisorIds);
        List<User> advisors = userRepository.findAllById(advisorIds);

        if (supervisors.isEmpty() || supervisors.size() != supervisorIds.size()) {
            throw new ResourceInvalidParametersException("No supervisors selected or supervisors not found");
        }

        if (advisors.isEmpty() || advisors.size() != advisorIds.size()) {
            throw new ResourceInvalidParametersException("No advisors selected or advisors not found");
        }

        topicRoleRepository.deleteByTopicId(topic.getId());
        topic.setRoles(new HashSet<>());

        for (User supervisor : supervisors) {
            if (!supervisor.hasAnyGroup("supervisor")) {
                throw new ResourceInvalidParametersException("User is not a supervisor");
            }

            saveTopicRole(topic, assigner, supervisor, ThesisRoleName.SUPERVISOR);
        }

        for (User advisor : advisors) {
            if (!advisor.hasAnyGroup("advisor", "supervisor")) {
                throw new ResourceInvalidParametersException("User is not an advisor");
            }

            saveTopicRole(topic, assigner, advisor, ThesisRoleName.ADVISOR);
        }
    }

    private void saveTopicRole(Topic topic, User assigner, User user, ThesisRoleName role) {
        if (assigner == null || user == null) {
            throw new ResourceInvalidParametersException("Assigner and user must be provided.");
        }

        TopicRole topicRole = new TopicRole();
        TopicRoleId topicRoleId = new TopicRoleId();

        topicRoleId.setTopicId(topic.getId());
        topicRoleId.setUserId(user.getId());
        topicRoleId.setRole(role);

        topicRole.setId(topicRoleId);
        topicRole.setUser(user);
        topicRole.setAssignedBy(assigner);
        topicRole.setAssignedAt(Instant.now());
        topicRole.setTopic(topic);

        topicRoleRepository.save(topicRole);

        Set<TopicRole> roles = topic.getRoles();
        roles.add(topicRole);
        topic.setRoles(roles);
    }
}
