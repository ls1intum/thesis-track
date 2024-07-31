package thesistrack.ls1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.controller.payload.LegacyCreateApplicationPayload;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.ApplicationRepository;
import thesistrack.ls1.repository.ThesisRepository;
import thesistrack.ls1.repository.TopicRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final UploadService uploadService;
    private final MailingService mailingService;
    private final TopicRepository topicRepository;
    private final ThesisRepository thesisRepository;
    private final ThesisService thesisService;

    @Autowired
    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            UploadService storageService,
            MailingService mailingService,
            TopicRepository topicRepository, ThesisRepository thesisRepository, ThesisService thesisService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;

        this.uploadService = storageService;
        this.mailingService = mailingService;
        this.topicRepository = topicRepository;
        this.thesisRepository = thesisRepository;
        this.thesisService = thesisService;
    }

    public Page<Application> getAll(String searchString, ApplicationState[] states, int page, int limit, String sortBy, String sortOrder) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        return applicationRepository
                .searchApplications(new HashSet<>(Arrays.stream(states).map(Enum::toString).toList()), searchString.toLowerCase(), PageRequest.of(page, limit, Sort.by(order)));
    }

    @Transactional
    public Application createLegacyApplication(
            LegacyCreateApplicationPayload payload,
            MultipartFile examinationReport,
            MultipartFile cv,
            MultipartFile degreeReport
    ) {
        Instant currentTime = Instant.now();

        User student = userRepository.findByUniversityId(payload.getUniversityId()).orElseGet(() -> {
            User user = new User();

            user.setJoinedAt(currentTime);

            return user;
        });
        Application application = new Application();

        student.setUniversityId(payload.getUniversityId());
        student.setMatriculationNumber(payload.getMatriculationNumber());
        student.setIsExchangeStudent(payload.getIsExchangeStudent());
        student.setFirstName(payload.getFirstName());
        student.setLastName(payload.getLastName());
        student.setGender(payload.getGender());
        student.setNationality(payload.getNationality());
        student.setEmail(payload.getEmail());
        student.setStudyDegree(payload.getStudyDegree());
        student.setStudyProgram(payload.getStudyProgram());
        student.setEnrolledAt(payload.getEnrolledAt());
        student.setSpecialSkills(payload.getSpecialSkills());
        student.setInterests(payload.getInterests());
        student.setProjects(payload.getProjects());
        student.setResearchAreas(payload.getResearchAreas());
        student.setFocusTopics(payload.getFocusTopics());
        student.setUpdatedAt(currentTime);

        student.setExaminationFilename(uploadService.store(examinationReport));
        student.setCvFilename(uploadService.store(cv));

        if (degreeReport != null && !degreeReport.isEmpty()) {
            student.setDegreeFilename(uploadService.store(degreeReport));
        }

        application.setUser(student);
        application.setThesisTitle(payload.getThesisTitle());
        application.setMotivation(payload.getMotivation());
        application.setState(ApplicationState.NOT_ASSESSED);
        application.setDesiredStartDate(payload.getDesiredStartDate());
        application.setCreatedAt(currentTime);

        mailingService.sendApplicationCreatedMailToChair(application);
        mailingService.sendApplicationCreatedMailToStudent(application);

        userRepository.save(student);

        return applicationRepository.save(application);
    }

    @Transactional
    public Application accept(
            UUID applicationId,
            User reviewer,
            String title,
            List<UUID> advisorIds,
            List<UUID> supervisorIds,
            String comment,
            boolean notifyUser,
            boolean closeTopic
    ) {
        Application application = findById(applicationId);
        Topic topic = application.getTopic();

        List<User> advisors = userRepository.findAllById(advisorIds);
        List<User> supervisors = userRepository.findAllById(supervisorIds);

        if (advisors.isEmpty() || advisors.size() != advisorIds.size()) {
            throw new ResourceInvalidParametersException("No advisors selected or advisors not found.");
        }

        if (supervisors.isEmpty() || supervisors.size() != supervisorIds.size()) {
            throw new ResourceInvalidParametersException("No supervisors selected or supervisor not found.");
        }

        application.setState(ApplicationState.ACCEPTED);
        application.setComment(comment);
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(reviewer);

        Thesis thesis = new Thesis();

        thesis.setTitle(title);
        thesis.setInfo("");
        thesis.setAbstractField("");
        thesis.setState(ThesisState.PROPOSAL);
        thesis.setApplication(application);
        thesis.setCreatedAt(Instant.now());

        thesis = thesisRepository.save(thesis);

        for (User advisor : advisors) {
            if (!advisor.hasGroup("advisor") && !advisor.hasGroup("supervisor")) {
                throw new ResourceInvalidParametersException("User is not an advisor.");
            }

            thesisService.saveThesisRole(thesis, reviewer, advisor, ThesisRoleName.ADVISOR);
        }

        for (User supervisor : supervisors) {
            if (!supervisor.hasGroup("supervisor")) {
                throw new ResourceInvalidParametersException("User is not a supervisor.");
            }

            thesisService.saveThesisRole(thesis, reviewer, supervisor, ThesisRoleName.SUPERVISOR);
        }

        thesisService.saveThesisRole(thesis, reviewer, application.getUser(), ThesisRoleName.STUDENT);

        if (topic != null && closeTopic) {
            topic.setClosedAt(Instant.now());

            topicRepository.save(topic);
        }

        if (notifyUser) {
            mailingService.sendApplicationAcceptanceEmail(application, advisors.getFirst());
        }

        return applicationRepository.save(application);
    }

    @Transactional
    public Application reject(UUID thesisApplicationId, User reviewer, String comment, boolean notifyUser) {
        Application application = findById(thesisApplicationId);

        application.setState(ApplicationState.REJECTED);
        application.setComment(comment);
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(reviewer);

        if (notifyUser) {
            mailingService.sendApplicationRejectionEmail(application);
        }

        return applicationRepository.save(application);
    }

    @Transactional
    public Application updateComment(UUID thesisApplicationId, String comment) {
        Application application = findById(thesisApplicationId);

        application.setComment(comment);

        return applicationRepository.save(application);
    }

    public Application findById(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Thesis application with id %s not found.", applicationId)));
    }
}
