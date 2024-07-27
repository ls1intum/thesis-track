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
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.ApplicationRepository;
import thesistrack.ls1.repository.UserRepository;

import java.time.Instant;
import java.util.*;

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

    public Page<Application> getAll(String searchString, String[] states, int page, int limit, String sortBy, String sortOrder) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        return applicationRepository
                .searchApplications(new HashSet<>(Arrays.asList(states)), searchString.toLowerCase(), PageRequest.of(page, limit, Sort.by(order)));
    }

    public Resource getExaminationReport(UUID thesisApplicationId) {
        Application application = findById(thesisApplicationId);

        return uploadService.load(application.getUser().getExaminationFilename());
    }

    public Resource getCV(UUID thesisApplicationId) {
        Application thesisApplication = findById(thesisApplicationId);

        return uploadService.load(thesisApplication.getUser().getCvFilename());
    }

    public Resource getBachelorReport(UUID thesisApplicationId) {
        Application thesisApplication = findById(thesisApplicationId);

        return uploadService.load(thesisApplication.getUser().getDegreeFilename());
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
    public Application accept(UUID applicationId, UUID advisorId, String comment, boolean notifyStudent) {
        Application application = findById(applicationId);
        User advisor = userService.findById(advisorId);

        application.setState(ApplicationState.ACCEPTED);
        application.setComment(comment);
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(advisor);

        if (notifyStudent) {
            mailingService.sendApplicationAcceptanceEmail(application, advisor);
        }

        return applicationRepository.save(application);
    }

    @Transactional
    public Application reject(UUID thesisApplicationId, String comment, boolean notifyStudent) {
        Application application = findById(thesisApplicationId);

        application.setState(ApplicationState.REJECTED);
        application.setComment(comment);
        application.setReviewedAt(Instant.now());

        if (notifyStudent) {
            mailingService.sendApplicationRejectionEmail(application);
        }

        return applicationRepository.save(application);
    }

    public Application findById(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Thesis application with id %s not found.", applicationId)));
    }
}
