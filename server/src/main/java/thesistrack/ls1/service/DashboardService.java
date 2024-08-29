package thesistrack.ls1.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import thesistrack.ls1.constants.ThesisPresentationVisibility;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.dto.TaskDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisPresentation;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.repository.ApplicationRepository;
import thesistrack.ls1.repository.ThesisPresentationRepository;
import thesistrack.ls1.repository.ThesisRepository;
import thesistrack.ls1.repository.TopicRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class DashboardService {
    private final ThesisPresentationRepository thesisPresentationRepository;
    private final ThesisRepository thesisRepository;
    private final ApplicationRepository applicationRepository;
    private final TopicRepository topicRepository;

    public DashboardService(ThesisPresentationRepository thesisPresentationRepository, ThesisRepository thesisRepository, ApplicationRepository applicationRepository, TopicRepository topicRepository) {
        this.thesisPresentationRepository = thesisPresentationRepository;
        this.thesisRepository = thesisRepository;
        this.applicationRepository = applicationRepository;
        this.topicRepository = topicRepository;
    }

    public Page<ThesisPresentation> getPresentations(Integer page, Integer limit, String sortBy, String sortOrder) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        return thesisPresentationRepository.findFuturePresentations(
                Instant.now(),
                Set.of(ThesisPresentationVisibility.PUBLIC),
                PageRequest.of(page, limit, Sort.by(order))
        );
    }

    public List<TaskDto> getTasks(User user) {
        List<TaskDto> tasks = new ArrayList<>();

        // general student tasks
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.STUDENT), null)) {
            if (thesis.getAbstractField().isBlank()) {
                tasks.add(new TaskDto(
                        "Add the abstract to your thesis",
                        getThesisLink(thesis),
                        thesis.getCreatedAt(),
                        null,
                        100
                ));
            }

            if (thesis.getInfo().isBlank()) {
                tasks.add(new TaskDto(
                        "Add \"Additional Information\" to your thesis",
                        getThesisLink(thesis),
                        thesis.getCreatedAt(),
                        null,
                        100
                ));
            }
        }

        // general advisor, supervisor tasks
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.ADVISOR, ThesisRoleName.SUPERVISOR), null)) {
            if (thesis.getState().equals(ThesisState.PROPOSAL)) {
                continue;
            }

            if (thesis.getStartDate() == null || thesis.getEndDate() == null) {
                tasks.add(new TaskDto(
                        "Add start and end date to thesis \"" + thesis.getTitle() + "\"",
                        getThesisLink(thesis),
                        thesis.getCreatedAt(),
                        null,
                        100
                ));
            }
        }

        // proposal task
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.STUDENT), Set.of(ThesisState.PROPOSAL))) {
            tasks.add(new TaskDto(
                    "Add a proposal to your thesis",
                    getThesisLink(thesis),
                    thesis.getCreatedAt(),
                    null,
                    100
            ));
        }

        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.ADVISOR, ThesisRoleName.SUPERVISOR), Set.of(ThesisState.PROPOSAL))) {
            if (!thesis.getProposals().isEmpty()) {
                continue;
            }

            tasks.add(new TaskDto(
                    "Review the proposal of thesis \"" + thesis.getTitle() + "\"",
                    getThesisLink(thesis),
                    thesis.getProposals().getFirst().getCreatedAt(),
                    null,
                    100
            ));
        }

        // thesis submission task
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.STUDENT), Set.of(ThesisState.WRITING))) {
            tasks.add(new TaskDto(
                    "Submit your final thesis and presentation",
                    getThesisLink(thesis),
                    thesis.getStartDate(),
                    thesis.getEndDate(),
                    100
            ));
        }

        // presentation tasks
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), null, Set.of(ThesisState.WRITING, ThesisState.SUBMITTED))) {
            if (!thesis.getPresentations().isEmpty()) {
                continue;
            }

            tasks.add(new TaskDto(
                    "Schedule a presentation date for thesis \"" + thesis.getTitle() + "\"",
                    getThesisLink(thesis),
                    thesis.getStartDate(),
                    null,
                    100
            ));
        }

        // thesis assessment task
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.ADVISOR, ThesisRoleName.SUPERVISOR), Set.of(ThesisState.SUBMITTED))) {
            tasks.add(new TaskDto(
                    "Add assessment to thesis \"" + thesis.getTitle() + "\"",
                    getThesisLink(thesis),
                    null,
                    null,
                    100
            ));
        }

        // grade thesis task
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.SUPERVISOR), Set.of(ThesisState.ASSESSED))) {
            tasks.add(new TaskDto(
                    "Add final grade to thesis \"" + thesis.getTitle() + "\"",
                    getThesisLink(thesis),
                    null,
                    null,
                    100
            ));
        }

        // close thesis task
        for (Thesis thesis : thesisRepository.findActiveThesesForRole(user.getId(), Set.of(ThesisRoleName.SUPERVISOR), Set.of(ThesisState.GRADED))) {
            tasks.add(new TaskDto(
                    "Complete thesis \"" + thesis.getTitle() + "\"",
                    getThesisLink(thesis),
                    null,
                    null,
                    100
            ));
        }

        if (user.hasAnyGroup("admin", "supervisor", "advisor")) {
            // review application task
            long unreviewedApplications = applicationRepository.countUnreviewedApplications(user.getId());

            if (unreviewedApplications > 10) {
                tasks.add(new TaskDto(
                        "You have " + unreviewedApplications + " unreviewed applications.",
                        "/applications",
                        null,
                        null,
                        100
                ));
            }

            // no open topic task
            long openTopics = topicRepository.countOpenTopics();

            if (openTopics == 0) {
                tasks.add(new TaskDto(
                        "There are no open Topics. Please create a topic.",
                        "/topics",
                        null,
                        null,
                        100
                ));
            }
        }


        return tasks;
    }

    private String getThesisLink(Thesis thesis) {
        return "/theses/" + thesis.getId();
    }
}
