package thesistrack.ls1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.controller.payload.LegacyCreateApplicationPayload;
import thesistrack.ls1.entity.Application;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.ApplicationRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UploadService uploadService;
    private final MailingService mailingService;

    @Autowired
    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            UserService userService,
            UploadService storageService,
            MailingService mailingService
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;

        this.userService = userService;
        this.uploadService = storageService;
        this.mailingService = mailingService;
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
    public Application accept(UUID applicationId, User reviewer, UUID advisorId, String comment, boolean notifyUser) {
        Application application = findById(applicationId);
        User advisor = userService.findById(advisorId);

        if (!advisor.hasGroup("advisor")) {
            throw new ResourceInvalidParametersException("User is not an advisor.");
        }

        application.setState(ApplicationState.ACCEPTED);
        application.setComment(comment);
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(reviewer);

        if (notifyUser) {
            mailingService.sendApplicationAcceptanceEmail(application, advisor);
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

    public Application findById(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Thesis application with id %s not found.", applicationId)));
    }
}
