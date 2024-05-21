package thesistrack.ls1.service;

import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.exception.FailedMailSend;
import thesistrack.ls1.exception.ResourceInvalidParametersException;
import thesistrack.ls1.model.Student;
import thesistrack.ls1.model.ThesisAdvisor;
import thesistrack.ls1.model.ThesisApplication;
import thesistrack.ls1.model.enums.ApplicationStatus;
import thesistrack.ls1.repository.StudentRepository;
import thesistrack.ls1.repository.ThesisAdvisorRepository;
import thesistrack.ls1.repository.ThesisApplicationRepository;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ThesisApplicationService {
    private final ThesisApplicationRepository thesisApplicationRepository;
    private final StudentRepository studentRepository;
    private final ThesisAdvisorRepository thesisAdvisorRepository;
    private final FileSystemStorageService storageService;
    private final MailingService mailingService;
    private final Path rootLocation;

    @Autowired
    public ThesisApplicationService(final ThesisApplicationRepository thesisApplicationRepository,
                                    final StudentRepository studentRepository,
                                    final ThesisAdvisorRepository thesisAdvisorRepository,
                                    final FileSystemStorageService storageService,
                                    final MailingService mailingService,
                                    @Value("${thesis-track.storage.theses-application-uploads-location}") String thesesApplicationsUploadsLocation) {
        this.thesisApplicationRepository = thesisApplicationRepository;
        this.studentRepository = studentRepository;
        this.thesisAdvisorRepository = thesisAdvisorRepository;
        this.storageService = storageService;
        this.mailingService = mailingService;
        this.rootLocation = Paths.get(thesesApplicationsUploadsLocation);
    }

    public Page<ThesisApplication> getAll(final int page, final int limit, final String sortBy, final String sortOrder) {
        final Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        return thesisApplicationRepository.findAll(PageRequest.of(page, limit, Sort.by(order)));
    }

    public List<ThesisApplication> getAllNotAssessed() {
        return thesisApplicationRepository.findAllNotAssessed();
    }

    public Resource getExaminationReport(final UUID thesisApplicationId) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        return storageService.load(rootLocation, thesisApplication.getExaminationReportFilename());
    }

    public Resource getCV(final UUID thesisApplicationId) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        return storageService.load(rootLocation, thesisApplication.getCvFilename());
    }

    public Resource getBachelorReport(final UUID thesisApplicationId) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        return storageService.load(rootLocation, thesisApplication.getBachelorReportFilename());
    }

    public ThesisApplication create(final ThesisApplication thesisApplication,
                                    final MultipartFile transcriptOfRecords,
                                    final MultipartFile cv,
                                    final MultipartFile bachelorReport) {
        final Student student = thesisApplication.getStudent();
        if (student == null ||
                (student.getTumId() == null && student.getMatriculationNumber() == null && student.getEmail() == null)) {
            throw new IllegalArgumentException(
                    "Student identification information must be provided: tum ID, matriculation number or email address.");
        }
        Optional<Student> existingStudent = findStudent(student.getTumId(), student.getMatriculationNumber(), student.getEmail());

        if (existingStudent.isEmpty()) {
            studentRepository.save(student);
        } else {
            thesisApplication.setStudent(checkAndUpdateStudent(existingStudent.get(), thesisApplication.getStudent()));
        }

        final String examinationReportFilename = storageService.store(rootLocation, transcriptOfRecords);
        thesisApplication.setExaminationReportFilename(examinationReportFilename);
        final String cvFilename = storageService.store(rootLocation, cv);
        thesisApplication.setCvFilename(cvFilename);
        if (bachelorReport != null && !bachelorReport.isEmpty()) {
            final String bachelorReportFilename = storageService.store(rootLocation, bachelorReport);
            thesisApplication.setBachelorReportFilename(bachelorReportFilename);
        }

        thesisApplication.setApplicationStatus(ApplicationStatus.NOT_ASSESSED);
        return thesisApplicationRepository.save(thesisApplication);
    }

    public ThesisApplication assess(final UUID thesisApplicationId,
                                    final ApplicationStatus status,
                                    final String assessmentComment) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        thesisApplication.setApplicationStatus(status);
        thesisApplication.setAssessmentComment(assessmentComment);
        return thesisApplicationRepository.save(thesisApplication);
    }

    public ThesisApplication assignThesisAdvisor(final UUID thesisApplicationId, final UUID thesisAdvisorId) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        final ThesisAdvisor thesisAdvisor = thesisAdvisorRepository.findById(thesisAdvisorId)
                .orElseThrow(() -> new ResourceInvalidParametersException(
                        String.format("Thesis advisor with id %s not found.", thesisAdvisorId)));
        thesisApplication.setThesisAdvisor(thesisAdvisor);
        return thesisApplicationRepository.save(thesisApplication);
    }

    public ThesisApplication accept(final UUID thesisApplicationId, final boolean notifyStudent) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        if (thesisApplication.getThesisAdvisor() == null) {
            throw new ResourceInvalidParametersException("Thesis advisor must be assigned before accepting a thesis application.");
        }

        thesisApplication.setApplicationStatus(ApplicationStatus.ACCEPTED);

        if (notifyStudent) {
            try {
                mailingService.sendThesisAcceptanceEmail(
                        thesisApplication.getStudent(), thesisApplication, thesisApplication.getThesisAdvisor());
            } catch (MessagingException e) {
                throw new FailedMailSend("Failed to send thesis acceptance email.");
            }
        }

        return thesisApplicationRepository.save(thesisApplication);
    }

    public ThesisApplication reject(final UUID thesisApplicationId, final boolean notifyStudent) {
        final ThesisApplication thesisApplication = findById(thesisApplicationId);
        thesisApplication.setApplicationStatus(ApplicationStatus.REJECTED);

        if (notifyStudent) {
            try {
                mailingService.sendThesisRejectionEmail(thesisApplication.getStudent(), thesisApplication);
            } catch (MessagingException e) {
                throw new FailedMailSend("Failed to send thesis rejection email.");
            }
        }

        return thesisApplicationRepository.save(thesisApplication);
    }

    public List<ThesisAdvisor> getAllThesisAdvisors() {
        return thesisAdvisorRepository.findAll();
    }

    public List<ThesisAdvisor> updateThesisAdvisorList(final ThesisAdvisor thesisAdvisor) {
        if (thesisAdvisor.getTumId() != null && !thesisAdvisor.getTumId().isBlank()) {
            if (thesisAdvisorRepository.findByTumId(thesisAdvisor.getTumId()).isEmpty()) {
                thesisAdvisorRepository.save(thesisAdvisor);
            }
        }

        return thesisAdvisorRepository.findAll();
    }

    private ThesisApplication findById(final UUID thesisApplicationId) {
        return thesisApplicationRepository.findById(thesisApplicationId)
                .orElseThrow(() -> new ResourceInvalidParametersException(
                        String.format("Thesis application with id %s not found.", thesisApplicationId)));
    }

    private Optional<Student> findStudent(final String tumId, final String matriculationNumber, final String email) {
        if ((tumId != null && !tumId.isBlank()) || (matriculationNumber != null && !matriculationNumber.isBlank())) {
            return studentRepository.findByTumIdOrMatriculationNumber(tumId, matriculationNumber);
        }
        return studentRepository.findByEmail(email);
    }

    private Student checkAndUpdateStudent(final Student existingStudent, final Student updatedStudent) {
        if (((existingStudent.getTumId() != null && !existingStudent.getTumId().isBlank()) && !existingStudent.getTumId().equals(updatedStudent.getTumId())) ||
                (existingStudent.getMatriculationNumber() != null && !existingStudent.getMatriculationNumber().isBlank()) && !existingStudent.getMatriculationNumber().equals(updatedStudent.getMatriculationNumber())) {
            throw new ResourceInvalidParametersException("Provided TUM ID does not match with the matriculation number you submitted. " +
                    "If You are sure the data is entered correct, please contact the Program Management.");
        }
        existingStudent.setGender(updatedStudent.getGender());
        existingStudent.setFirstName(updatedStudent.getFirstName());
        existingStudent.setLastName(updatedStudent.getLastName());
        existingStudent.setEmail(updatedStudent.getEmail());

        return studentRepository.save(existingStudent);
    }
}
