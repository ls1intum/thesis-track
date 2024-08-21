package thesistrack.ls1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.*;
import thesistrack.ls1.controller.payload.ThesisStatePayload;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.entity.key.ThesisRoleId;
import thesistrack.ls1.entity.key.ThesisStateChangeId;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.*;

import java.time.Instant;
import java.util.*;

@Service
public class ThesisService {
    private final ThesisRoleRepository thesisRoleRepository;
    private final ThesisRepository thesisRepository;
    private final ThesisStateChangeRepository thesisStateChangeRepository;
    private final UserRepository userRepository;
    private final UploadService uploadService;
    private final ThesisProposalRepository thesisProposalRepository;
    private final ThesisAssessmentRepository thesisAssessmentRepository;
    private final ThesisPresentationRepository thesisPresentationRepository;
    private final MailingService mailingService;

    @Autowired
    public ThesisService(
            ThesisRoleRepository thesisRoleRepository,
            ThesisRepository thesisRepository,
            ThesisStateChangeRepository thesisStateChangeRepository,
            UserRepository userRepository,
            ThesisProposalRepository thesisProposalRepository,
            ThesisAssessmentRepository thesisAssessmentRepository,
            UploadService uploadService,
            ThesisPresentationRepository thesisPresentationRepository, MailingService mailingService) {
        this.thesisRoleRepository = thesisRoleRepository;
        this.thesisRepository = thesisRepository;
        this.thesisStateChangeRepository = thesisStateChangeRepository;
        this.userRepository = userRepository;
        this.uploadService = uploadService;
        this.thesisProposalRepository = thesisProposalRepository;
        this.thesisAssessmentRepository = thesisAssessmentRepository;
        this.thesisPresentationRepository = thesisPresentationRepository;
        this.mailingService = mailingService;
    }

    public Page<Thesis> getAll(
            UUID userId,
            Set<ThesisVisibility> visibilities,
            String searchQuery,
            ThesisState[] states,
            int page,
            int limit,
            String sortBy,
            String sortOrder
    ) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        String searchQueryFilter = searchQuery == null || searchQuery.isEmpty() ? null : searchQuery.toLowerCase();
        Set<ThesisState> statesFilter = states == null || states.length == 0 ? null : new HashSet<>(Arrays.asList(states));

        return thesisRepository.searchTheses(
                userId,
                visibilities,
                searchQueryFilter,
                statesFilter,
                PageRequest.of(page, limit, Sort.by(order))
        );
    }

    @Transactional
    public Thesis createThesis(
            User creator,
            String thesisTitle,
            String thesisType,
            Set<UUID> supervisorIds,
            Set<UUID> advisorIds,
            Set<UUID> studentIds,
            Application application
    ) {
        Thesis thesis = new Thesis();

        thesis.setTitle(thesisTitle);
        thesis.setType(thesisType);
        thesis.setInfo("");
        thesis.setAbstractField("");
        thesis.setState(ThesisState.PROPOSAL);
        thesis.setApplication(application);
        thesis.setCreatedAt(Instant.now());
        thesis.setVisibility(ThesisVisibility.PRIVATE);

        thesis = thesisRepository.save(thesis);

        assignThesisRoles(thesis, creator, supervisorIds, advisorIds, studentIds);
        saveStateChange(thesis, ThesisState.PROPOSAL, Instant.now());

        mailingService.sendThesisCreatedEmail(thesis);

        return thesis;
    }

    @Transactional
    public Thesis closeThesis(Thesis thesis) {
        if (thesis.getState() == ThesisState.DROPPED_OUT || thesis.getState() == ThesisState.FINISHED) {
            throw new ResourceInvalidParametersException("Thesis is already completed");
        }

        thesis.setState(ThesisState.DROPPED_OUT);
        saveStateChange(thesis, ThesisState.DROPPED_OUT, Instant.now());

        thesis = thesisRepository.save(thesis);

        mailingService.sendThesisClosedEmail(thesis);

        return thesis;
    }

    @Transactional
    public Thesis updateThesis(
            User updater,
            Thesis thesis,
            String thesisTitle,
            String thesisType,
            ThesisVisibility visibility,
            Instant startDate,
            Instant endDate,
            Set<UUID> studentIds,
            Set<UUID> advisorIds,
            Set<UUID> supervisorIds,
            List<ThesisStatePayload> states
    ) {
        thesis.setTitle(thesisTitle);
        thesis.setType(thesisType);
        thesis.setVisibility(visibility);

        if ((startDate == null && endDate != null) || (startDate != null && endDate == null)) {
            throw new ResourceInvalidParametersException("Both start and end date must be provided.");
        }

        thesis.setStartDate(startDate);
        thesis.setEndDate(endDate);

        assignThesisRoles(thesis, updater, supervisorIds, advisorIds, studentIds);

        for (ThesisStatePayload state : states) {
            saveStateChange(thesis, state.state(), state.changedAt());
        }

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis updateThesisInfo(
            Thesis thesis,
            String abstractText,
            String infoText
    ) {
        thesis.setAbstractField(abstractText);
        thesis.setInfo(infoText);

        return thesisRepository.save(thesis);
    }

    /* PROPOSAL */

    public Resource getProposalFile(Thesis thesis) {
        List<ThesisProposal> proposals = thesis.getProposals();

        if (proposals.isEmpty()) {
            throw new ResourceNotFoundException("Proposal file not found");
        }

        return uploadService.load(proposals.getFirst().getProposalFilename());
    }

    @Transactional
    public Thesis uploadProposal(User uploader, Thesis thesis, MultipartFile proposalFile) {
        ThesisProposal proposal = new ThesisProposal();

        proposal.setThesis(thesis);
        proposal.setProposalFilename(uploadService.store(proposalFile, 3 * 1024 * 1024));
        proposal.setCreatedAt(Instant.now());
        proposal.setCreatedBy(uploader);

        List<ThesisProposal> proposals = thesis.getProposals() == null ? new ArrayList<>() : thesis.getProposals();
        proposals.addFirst(proposal);

        thesis.setProposals(proposals);
        thesis.setState(ThesisState.PROPOSAL);

        thesisProposalRepository.save(proposal);

        mailingService.sendProposalUploadedEmail(proposal);

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis acceptProposal(User reviewer, Thesis thesis) {
        List<ThesisProposal> proposals = thesis.getProposals();

        if (proposals == null || proposals.isEmpty()) {
            throw new ResourceNotFoundException("No proposal added to thesis yet");
        }

        ThesisProposal proposal = proposals.getFirst();

        proposal.setApprovedAt(Instant.now());
        proposal.setApprovedBy(reviewer);

        thesisProposalRepository.save(proposal);

        saveStateChange(thesis, ThesisState.WRITING, Instant.now());

        thesis.setState(ThesisState.WRITING);

        mailingService.sendProposalAcceptedEmail(thesis);

        return thesisRepository.save(thesis);
    }

    /* WRITING */

    @Transactional
    public Thesis submitThesis(Thesis thesis) {
        if (thesis.getFinalThesisFilename() == null || thesis.getFinalPresentationFilename() == null) {
            throw new ResourceInvalidParametersException("Thesis or presentation file not uploaded yet");
        }

        thesis.setState(ThesisState.SUBMITTED);

        saveStateChange(thesis, ThesisState.SUBMITTED, Instant.now());

        mailingService.sendFinalSubmissionEmail(thesis);

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis uploadPresentation(Thesis thesis, MultipartFile presentationFile) {
        thesis.setFinalPresentationFilename(uploadService.store(presentationFile, 3 * 1024 * 1024));

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis uploadThesis(Thesis thesis, MultipartFile thesisFile) {
        thesis.setFinalThesisFilename(uploadService.store(thesisFile, 3 * 1024 * 1024));

        return thesisRepository.save(thesis);
    }

    public Resource getPresentationFile(Thesis thesis) {
        String filename = thesis.getFinalPresentationFilename();

        if (filename == null) {
            throw new ResourceNotFoundException("Presentation file not found.");
        }

        return uploadService.load(filename);
    }

    public Resource getThesisFile(Thesis thesis) {
        String filename = thesis.getFinalThesisFilename();

        if (filename == null) {
            throw new ResourceNotFoundException("Thesis file not found.");
        }

        return uploadService.load(filename);
    }

    public Thesis createPresentation(User creator, Thesis thesis, ThesisPresentationType type, ThesisPresentationVisibility visibility, String location, String streamUrl, Instant date) {
        ThesisPresentation presentation = new ThesisPresentation();

        presentation.setThesis(thesis);
        presentation.setType(type);
        presentation.setVisibility(visibility);
        presentation.setLocation(location);
        presentation.setStreamUrl(streamUrl);
        presentation.setScheduledAt(date);
        presentation.setCreatedBy(creator);
        presentation.setCreatedAt(Instant.now());

        presentation = thesisPresentationRepository.save(presentation);

        List<ThesisPresentation> presentations = thesis.getPresentations();
        presentations.add(presentation);
        presentations.sort(Comparator.comparing(ThesisPresentation::getScheduledAt));
        thesis.setPresentations(presentations);

        thesis = thesisRepository.save(thesis);

        mailingService.sendNewScheduledPresentationEmail(presentation);

        return thesis;
    }

    public Thesis deletePresentation(ThesisPresentation presentation) {
        Thesis thesis = presentation.getThesis();

        thesisPresentationRepository.deleteById(presentation.getId());

        List<ThesisPresentation> presentations = new ArrayList<>(thesis.getPresentations().stream()
                .filter(x -> !presentation.getId().equals(x.getId()))
                .toList());

        thesis.setPresentations(presentations);

        mailingService.sendPresentationDeletedEmail(presentation);

        return thesisRepository.save(thesis);
    }

    /* ASSESSMENT */
    @Transactional
    public Thesis submitAssessment(
            User creator,
            Thesis thesis,
            String summary,
            String positives,
            String negatives,
            String gradeSuggestion
    ) {
        ThesisAssessment assessment = new ThesisAssessment();

        assessment.setThesis(thesis);
        assessment.setCreatedBy(creator);
        assessment.setCreatedAt(Instant.now());
        assessment.setSummary(summary);
        assessment.setPositives(positives);
        assessment.setNegatives(negatives);
        assessment.setGradeSuggestion(gradeSuggestion);

        thesisAssessmentRepository.save(assessment);

        List<ThesisAssessment> assessments = Objects.requireNonNullElse(thesis.getAssessments(), new ArrayList<>());
        assessments.addFirst(assessment);

        thesis.setAssessments(assessments);
        thesis.setState(ThesisState.ASSESSED);

        saveStateChange(thesis, ThesisState.ASSESSED, Instant.now());

        mailingService.sendAssessmentAddedEmail(assessment);

        return thesisRepository.save(thesis);
    }

    /* GRADING */
    public Thesis gradeThesis(Thesis thesis, String finalGrade, String finalFeedback, ThesisVisibility visibility) {
        thesis.setState(ThesisState.GRADED);
        thesis.setVisibility(visibility);
        thesis.setFinalGrade(finalGrade);
        thesis.setFinalFeedback(finalFeedback);

        saveStateChange(thesis, ThesisState.GRADED, Instant.now());

        mailingService.sendFinalGradeEmail(thesis);

        return thesisRepository.save(thesis);
    }

    public Thesis completeThesis(Thesis thesis) {
        thesis.setState(ThesisState.FINISHED);

        saveStateChange(thesis, ThesisState.FINISHED, Instant.now());

        return thesisRepository.save(thesis);
    }

    /* UTILITY */

    public Thesis findById(UUID thesisId) {
        return thesisRepository.findById(thesisId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Thesis with id %s not found.", thesisId)));
    }

    public ThesisPresentation findPresentationById(UUID thesisId, UUID presentationId) {
        ThesisPresentation presentation = thesisPresentationRepository.findById(presentationId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Presentation with id %s not found.", presentationId)));

        if (!presentation.getThesis().getId().equals(thesisId)) {
            throw new ResourceNotFoundException(String.format("Presentation with id %s not found for thesis with id %s.", presentationId, thesisId));
        }

        return presentation;
    }

    private void assignThesisRoles(
            Thesis thesis,
            User assigner,
            Set<UUID> supervisorIds,
            Set<UUID> advisorIds,
            Set<UUID> studentIds
    ) {
        List<User> supervisors = userRepository.findAllById(supervisorIds);
        List<User> advisors = userRepository.findAllById(advisorIds);
        List<User> students = userRepository.findAllById(studentIds);

        if (supervisors.isEmpty() || supervisors.size() != supervisorIds.size()) {
            throw new ResourceInvalidParametersException("No supervisors selected or supervisors not found");
        }

        if (advisors.isEmpty() || advisors.size() != advisorIds.size()) {
            throw new ResourceInvalidParametersException("No advisors selected or advisors not found");
        }

        if (students.isEmpty() || students.size() != studentIds.size()) {
            throw new ResourceInvalidParametersException("No students selected or students not found");
        }

        thesisRoleRepository.deleteByThesisId(thesis.getId());
        thesis.setRoles(new HashSet<>());

        for (User supervisor : supervisors) {
            if (!supervisor.hasAnyGroup("supervisor")) {
                throw new ResourceInvalidParametersException("User is not a supervisor");
            }

            saveThesisRole(thesis, assigner, supervisor, ThesisRoleName.SUPERVISOR);
        }

        for (User advisor : advisors) {
            if (!advisor.hasAnyGroup("advisor", "supervisor")) {
                throw new ResourceInvalidParametersException("User is not an advisor");
            }

            saveThesisRole(thesis, assigner, advisor, ThesisRoleName.ADVISOR);
        }

        for (User student : students) {
            saveThesisRole(thesis, assigner, student, ThesisRoleName.STUDENT);
        }
    }

    private void saveStateChange(Thesis thesis, ThesisState state, Instant changedAt) {
        ThesisStateChangeId stateChangeId = new ThesisStateChangeId();
        stateChangeId.setThesisId(thesis.getId());
        stateChangeId.setState(state);

        ThesisStateChange stateChange = new ThesisStateChange();
        stateChange.setId(stateChangeId);
        stateChange.setThesis(thesis);
        stateChange.setChangedAt(changedAt);

        thesisStateChangeRepository.save(stateChange);

        Set<ThesisStateChange> stateChanges = thesis.getStates();
        stateChanges.add(stateChange);
        thesis.setStates(stateChanges);
    }

    private void saveThesisRole(Thesis thesis, User assigner, User user, ThesisRoleName role) {
        if (assigner == null || user == null) {
            throw new ResourceInvalidParametersException("Assigner and user must be provided.");
        }

        ThesisRole thesisRole = new ThesisRole();
        ThesisRoleId thesisRoleId = new ThesisRoleId();

        thesisRoleId.setThesisId(thesis.getId());
        thesisRoleId.setUserId(user.getId());
        thesisRoleId.setRole(role);

        thesisRole.setId(thesisRoleId);
        thesisRole.setUser(user);
        thesisRole.setAssignedBy(assigner);
        thesisRole.setAssignedAt(Instant.now());
        thesisRole.setThesis(thesis);

        thesisRoleRepository.save(thesisRole);

        Set<ThesisRole> roles = thesis.getRoles();
        roles.add(thesisRole);
        thesis.setRoles(roles);
    }
}
