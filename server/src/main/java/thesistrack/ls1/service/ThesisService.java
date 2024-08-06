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
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.controller.payload.ThesisStatePayload;
import thesistrack.ls1.controller.payload.UpdateThesisPayload;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.entity.key.ThesisRoleId;
import thesistrack.ls1.entity.key.ThesisStateChangeId;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.*;
import thesistrack.ls1.utility.RequestValidator;

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

    @Autowired
    public ThesisService(
            ThesisRoleRepository thesisRoleRepository,
            ThesisRepository thesisRepository,
            ThesisStateChangeRepository thesisStateChangeRepository,
            UserRepository userRepository,
            UploadService uploadService,
            ThesisProposalRepository thesisProposalRepository, ThesisAssessmentRepository thesisAssessmentRepository) {
        this.thesisRoleRepository = thesisRoleRepository;
        this.thesisRepository = thesisRepository;
        this.thesisStateChangeRepository = thesisStateChangeRepository;
        this.userRepository = userRepository;
        this.uploadService = uploadService;
        this.thesisProposalRepository = thesisProposalRepository;
        this.thesisAssessmentRepository = thesisAssessmentRepository;
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
            String title,
            Set<UUID> supervisorIds,
            Set<UUID> advisorIds,
            Set<UUID> studentIds,
            Application application
    ) {
        Thesis thesis = new Thesis();

        thesis.setTitle(RequestValidator.validateStringMaxLength(title, 500));
        thesis.setInfo("");
        thesis.setAbstractField("");
        thesis.setState(ThesisState.PROPOSAL);
        thesis.setApplication(application);
        thesis.setCreatedAt(Instant.now());
        thesis.setVisibility(ThesisVisibility.PRIVATE);

        thesis = thesisRepository.save(thesis);

        assignThesisRoles(thesis, creator, supervisorIds, advisorIds, studentIds);
        saveStateChange(thesis, ThesisState.PROPOSAL);

        return findById(thesis.getId());
    }

    @Transactional
    public Thesis closeThesis(Thesis thesis) {
        if (thesis.getState() == ThesisState.DROPPED_OUT || thesis.getState() == ThesisState.FINISHED) {
            throw new ResourceInvalidParametersException("Thesis is already completed");
        }

        thesis.setState(ThesisState.DROPPED_OUT);
        saveStateChange(thesis, ThesisState.DROPPED_OUT);

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis updateThesis(
            User updater,
            Thesis thesis,
            String thesisTitle,
            ThesisVisibility visibility,
            Instant startDate,
            Instant endDate,
            Set<UUID> studentIds,
            Set<UUID> advisorIds,
            Set<UUID> supervisorIds,
            List<ThesisStatePayload> states
    ) {
        thesis.setTitle(RequestValidator.validateStringMaxLength(thesisTitle, 500));
        thesis.setVisibility(visibility);

        if ((startDate == null && endDate != null) || (startDate != null && endDate == null)) {
            throw new ResourceInvalidParametersException("Both start and end date must be provided.");
        }

        thesis.setStartDate(startDate);
        thesis.setEndDate(endDate);

        assignThesisRoles(thesis, updater, supervisorIds, advisorIds, studentIds);

        for (ThesisStatePayload state : states) {
            saveStateChange(thesis, state.state());
        }

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis updateThesisInfo(
            Thesis thesis,
            String abstractText,
            String infoText
    ) {
        thesis.setAbstractField(RequestValidator.validateStringMaxLength(abstractText, 2000));
        thesis.setInfo(RequestValidator.validateStringMaxLength(infoText, 2000));

        return thesisRepository.save(thesis);
    }

    /* PROPOSAL */

    public Resource getProposalFile(Thesis thesis) {
        List<ThesisProposal> proposals = thesis.getProposals();

        if (proposals == null || proposals.isEmpty()) {
            throw new ResourceNotFoundException("Proposal file not found.");
        }

        return uploadService.load(proposals.getFirst().getProposalFilename());
    }

    @Transactional
    public Thesis uploadProposal(User uploader, Thesis thesis, MultipartFile proposalFile) {
        if (proposalFile == null ) {
            throw new ResourceInvalidParametersException("No proposal added to request");
        }

        ThesisProposal proposal = new ThesisProposal();

        proposal.setThesis(thesis);
        proposal.setProposalFilename(uploadService.store(proposalFile, 3 * 1024 * 1024));
        proposal.setCreatedAt(Instant.now());
        proposal.setCreatedBy(uploader);

        List<ThesisProposal> proposals = thesis.getProposals() == null ? new ArrayList<>() : thesis.getProposals();
        proposals.addFirst(proposal);
        thesis.setProposals(proposals);

        thesisProposalRepository.save(proposal);

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

        saveStateChange(thesis, ThesisState.WRITING);

        thesis.setState(ThesisState.WRITING);

        return thesisRepository.save(thesis);
    }

    /* WRITING */

    @Transactional
    public Thesis submitThesis(Thesis thesis) {
        thesis.setState(ThesisState.SUBMITTED);

        saveStateChange(thesis, ThesisState.SUBMITTED);

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
        assessment.setSummary(RequestValidator.validateStringMaxLength(summary, 2000));
        assessment.setPositives(RequestValidator.validateStringMaxLength(positives, 2000));
        assessment.setNegatives(RequestValidator.validateStringMaxLength(negatives, 2000));
        assessment.setGradeSuggestion(RequestValidator.validateStringMaxLength(gradeSuggestion, 100));

        thesisAssessmentRepository.save(assessment);

        List<ThesisAssessment> assessments = Objects.requireNonNullElse(thesis.getAssessments(), new ArrayList<>());
        assessments.addFirst(assessment);

        thesis.setAssessments(assessments);
        thesis.setState(ThesisState.ASSESSED);

        saveStateChange(thesis, ThesisState.ASSESSED);

        return thesisRepository.save(thesis);
    }

    /* GRADING */
    public Thesis gradeThesis(Thesis thesis, String finalGrade, String finalFeedback) {
        thesis.setState(ThesisState.GRADED);
        thesis.setFinalGrade(RequestValidator.validateStringMaxLength(finalGrade, 10));
        thesis.setFinalFeedback(RequestValidator.validateStringMaxLength(finalFeedback, 2000));

        saveStateChange(thesis, ThesisState.GRADED);

        return thesisRepository.save(thesis);
    }

    public Thesis completeThesis(Thesis thesis) {
        thesis.setState(ThesisState.FINISHED);

        saveStateChange(thesis, ThesisState.FINISHED);

        return thesisRepository.save(thesis);
    }

    /* UTILITY */

    public Thesis findById(UUID thesisId) {
        return thesisRepository.findById(thesisId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Thesis with id %s not found.", thesisId)));
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

    private void saveStateChange(Thesis thesis, ThesisState state) {
        ThesisStateChangeId stateChangeId = new ThesisStateChangeId();
        stateChangeId.setThesisId(thesis.getId());
        stateChangeId.setState(state);

        ThesisStateChange stateChange = new ThesisStateChange();
        stateChange.setId(stateChangeId);
        stateChange.setThesis(thesis);
        stateChange.setChangedAt(Instant.now());

        thesisStateChangeRepository.save(stateChange);

        List<ThesisStateChange> stateChanges = thesis.getStates() == null ? new ArrayList<>() : thesis.getStates();
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

        List<ThesisRole> roles = thesis.getRoles() == null ? new ArrayList<>() : thesis.getRoles();

        roles.add(thesisRole);

        thesis.setRoles(roles);
    }
}
