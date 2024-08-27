package thesistrack.ls1.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import thesistrack.ls1.dto.TaskDto;
import thesistrack.ls1.entity.ThesisPresentation;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.repository.ThesisPresentationRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {
    private final ThesisPresentationRepository thesisPresentationRepository;

    public DashboardService(ThesisPresentationRepository thesisPresentationRepository) {
        this.thesisPresentationRepository = thesisPresentationRepository;
    }

    public Page<ThesisPresentation> getPresentations(Integer page, Integer limit, String sortBy, String sortOrder) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        return thesisPresentationRepository.findFuturePresentations(Instant.now(), PageRequest.of(page, limit, Sort.by(order)));
    }

    public List<TaskDto> getTasks(User user) {
        List<TaskDto> tasks = new ArrayList<>();

        // proposal task

        // thesis submission task

        // presentation tasks

        // thesis assessment task

        // grade thesis task

        // close thesis task

        // review application task

        // no open topic task

        return tasks;
    }
}
