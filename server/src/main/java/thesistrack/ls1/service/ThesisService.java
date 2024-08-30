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
import java.time.temporal.ChronoUnit;
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
    private final MailingService mailingService;
    private final AccessManagementService accessManagementService;
    private final ThesisPresentationService thesisPresentationService;

    @Autowired
    public ThesisService(
            ThesisRoleRepository thesisRoleRepository,
            ThesisRepository thesisRepository,
            ThesisStateChangeRepository thesisStateChangeRepository,
            UserRepository userRepository,
            ThesisProposalRepository thesisProposalRepository,
            ThesisAssessmentRepository thesisAssessmentRepository,
            UploadService uploadService,
            MailingService mailingService,
            AccessManagementService accessManagementService,
            ThesisPresentationService thesisPresentationService
    ) {
        this.thesisRoleRepository = thesisRoleRepository;
        this.thesisRepository = thesisRepository;
        this.thesisStateChangeRepository = thesisStateChangeRepository;
        this.userRepository = userRepository;
        this.uploadService = uploadService;
        this.thesisProposalRepository = thesisProposalRepository;
        this.thesisAssessmentRepository = thesisAssessmentRepository;
        this.mailingService = mailingService;
        this.accessManagementService = accessManagementService;
        this.thesisPresentationService = thesisPresentationService;
    }

    public Page<Thesis> getAll(
            UUID userId,
            Set<ThesisVisibility> visibilities,
            String searchQuery,
            ThesisState[] states,
            String[] types,
            int page,
            int limit,
            String sortBy,
            String sortOrder
    ) {
        Sort.Order order = new Sort.Order(sortOrder.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        String searchQueryFilter = searchQuery == null || searchQuery.isEmpty() ? null : searchQuery.toLowerCase();
        Set<ThesisState> statesFilter = states == null || states.length == 0 ? null : new HashSet<>(Arrays.asList(states));
        Set<String> typesFilter = types == null || types.length == 0 ? null : new HashSet<>(Arrays.asList(types));

        return thesisRepository.searchTheses(
                userId,
                visibilities,
                searchQueryFilter,
                statesFilter,
                typesFilter,
                PageRequest.of(page, limit, Sort.by(order))
        );
    }

    @Transactional
    public Thesis createThesis(
            User creator,
            String thesisTitle,
            String thesisType,
            List<UUID> supervisorIds,
            List<UUID> advisorIds,
            List<UUID> studentIds,
            Application application
    ) {
        Thesis thesis = new Thesis();

        thesis.setTitle(thesisTitle);
        thesis.setType(thesisType);
        thesis.setVisibility(ThesisVisibility.INTERNAL);
        thesis.setKeywords(new HashSet<>());
        thesis.setInfo("");
        thesis.setAbstractField("");
        thesis.setState(ThesisState.PROPOSAL);
        thesis.setApplication(application);
        thesis.setCreatedAt(Instant.now());

        thesis = thesisRepository.save(thesis);

        assignThesisRoles(thesis, creator, supervisorIds, advisorIds, studentIds);
        saveStateChange(thesis, ThesisState.PROPOSAL, Instant.now());

        mailingService.sendThesisCreatedEmail(creator, thesis);

        for (User student : thesis.getStudents()) {
            accessManagementService.addStudentGroup(student);
        }

        return thesis;
    }

    @Transactional
    public Thesis closeThesis(User closingUser, Thesis thesis) {
        if (thesis.getState() == ThesisState.DROPPED_OUT || thesis.getState() == ThesisState.FINISHED) {
            throw new ResourceInvalidParametersException("Thesis is already completed");
        }

        thesis.setState(ThesisState.DROPPED_OUT);
        saveStateChange(thesis, ThesisState.DROPPED_OUT, Instant.now());

        thesis = thesisRepository.save(thesis);

        mailingService.sendThesisClosedEmail(closingUser, thesis);

        for (User student : thesis.getStudents()) {
            if (!existsPendingThesis(student)) {
                accessManagementService.removeStudentGroup(student);
            }
        }

        return thesis;
    }

    @Transactional
    public Thesis updateThesis(
            User updatingUser,
            Thesis thesis,
            String thesisTitle,
            String thesisType,
            ThesisVisibility visibility,
            Set<String> keywords,
            Instant startDate,
            Instant endDate,
            List<UUID> studentIds,
            List<UUID> advisorIds,
            List<UUID> supervisorIds,
            List<ThesisStatePayload> states
    ) {
        thesis.setTitle(thesisTitle);
        thesis.setType(thesisType);
        thesis.setVisibility(visibility);
        thesis.setKeywords(keywords);

        if ((startDate == null && endDate != null) || (startDate != null && endDate == null)) {
            throw new ResourceInvalidParametersException("Both start and end date must be provided.");
        }

        thesis.setStartDate(startDate);
        thesis.setEndDate(endDate);

        assignThesisRoles(thesis, updatingUser, supervisorIds, advisorIds, studentIds);

        for (ThesisStatePayload state : states) {
            saveStateChange(thesis, state.state(), state.changedAt());
        }

        thesis = thesisRepository.save(thesis);

        thesisPresentationService.updateThesisCalendarEvents(thesis);

        return thesis;
    }

    @Transactional
    public Thesis updateThesisInfo(
            Thesis thesis,
            String abstractText,
            String infoText
    ) {
        thesis.setAbstractField(abstractText);
        thesis.setInfo(infoText);

        thesis = thesisRepository.save(thesis);

        thesisPresentationService.updateThesisCalendarEvents(thesis);

        return thesis;
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
    public Thesis uploadProposal(User uploadingUser, Thesis thesis, MultipartFile proposalFile) {
        ThesisProposal proposal = new ThesisProposal();

        proposal.setThesis(thesis);
        proposal.setProposalFilename(uploadService.store(proposalFile, 20 * 1024 * 1024));
        proposal.setCreatedAt(Instant.now());
        proposal.setCreatedBy(uploadingUser);

        List<ThesisProposal> proposals = thesis.getProposals() == null ? new ArrayList<>() : thesis.getProposals();
        proposals.addFirst(proposal);

        thesis.setProposals(proposals);
        thesis.setState(ThesisState.PROPOSAL);

        thesisProposalRepository.save(proposal);

        mailingService.sendProposalUploadedEmail(proposal);

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis acceptProposal(User reviewingUser, Thesis thesis) {
        List<ThesisProposal> proposals = thesis.getProposals();

        if (proposals == null || proposals.isEmpty()) {
            throw new ResourceNotFoundException("No proposal added to thesis yet");
        }

        ThesisProposal proposal = proposals.getFirst();

        proposal.setApprovedAt(Instant.now());
        proposal.setApprovedBy(reviewingUser);

        thesisProposalRepository.save(proposal);

        saveStateChange(thesis, ThesisState.WRITING, Instant.now());

        thesis.setState(ThesisState.WRITING);

        mailingService.sendProposalAcceptedEmail(proposal);

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
        thesis.setFinalPresentationFilename(uploadService.store(presentationFile, 20 * 1024 * 1024));

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis uploadThesis(Thesis thesis, MultipartFile thesisFile) {
        thesis.setFinalThesisFilename(uploadService.store(thesisFile, 20 * 1024 * 1024));

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

    /* ASSESSMENT */
    @Transactional
    public Thesis submitAssessment(
            User creatingUser,
            Thesis thesis,
            String summary,
            String positives,
            String negatives,
            String gradeSuggestion
    ) {
        ThesisAssessment assessment = new ThesisAssessment();

        assessment.setThesis(thesis);
        assessment.setCreatedBy(creatingUser);
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
    @Transactional
    public Thesis gradeThesis(Thesis thesis, String finalGrade, String finalFeedback, ThesisVisibility visibility) {
        thesis.setState(ThesisState.GRADED);
        thesis.setVisibility(visibility);
        thesis.setFinalGrade(finalGrade);
        thesis.setFinalFeedback(finalFeedback);

        saveStateChange(thesis, ThesisState.GRADED, Instant.now());

        mailingService.sendFinalGradeEmail(thesis);

        return thesisRepository.save(thesis);
    }

    @Transactional
    public Thesis completeThesis(Thesis thesis) {
        thesis.setState(ThesisState.FINISHED);

        saveStateChange(thesis, ThesisState.FINISHED, Instant.now());

        thesis = thesisRepository.save(thesis);

        for (User student : thesis.getStudents()) {
            if (!existsPendingThesis(student)) {
                accessManagementService.removeStudentGroup(student);
            }
        }

        return thesis;
    }

    /* UTILITY */

    private boolean existsPendingThesis(User user) {
        Page<Thesis> theses = thesisRepository.searchTheses(
                user.getId(),
                null,
                null,
                Set.of(
                        ThesisState.PROPOSAL,
                        ThesisState.WRITING,
                        ThesisState.SUBMITTED,
                        ThesisState.ASSESSED,
                        ThesisState.GRADED
                ),
                null,
                PageRequest.ofSize(1)
        );

        return theses.getTotalElements() > 0;
    }

    public Thesis findById(UUID thesisId) {
        return thesisRepository.findById(thesisId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Thesis with id %s not found.", thesisId)));
    }

    private void assignThesisRoles(
            Thesis thesis,
            User assigner,
            List<UUID> supervisorIds,
            List<UUID> advisorIds,
            List<UUID> studentIds
    ) {
        List<User> supervisors = userRepository.findAllById(supervisorIds);
        List<User> advisors = userRepository.findAllById(advisorIds);
        List<User> students = userRepository.findAllById(studentIds);

        supervisors.sort(Comparator.comparing(user -> supervisorIds.indexOf(user.getId())));
        advisors.sort(Comparator.comparing(user -> advisorIds.indexOf(user.getId())));
        students.sort(Comparator.comparing(user -> studentIds.indexOf(user.getId())));

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
        thesis.setRoles(new ArrayList<>());

        for (int i = 0; i < supervisors.size(); i++) {
            User supervisor = supervisors.get(i);

            if (!supervisor.hasAnyGroup("supervisor")) {
                throw new ResourceInvalidParametersException("User is not a supervisor");
            }

            saveThesisRole(thesis, assigner, supervisor, ThesisRoleName.SUPERVISOR, i);
        }

        for (int i = 0; i < advisors.size(); i++) {
            User advisor = advisors.get(i);

            if (!advisor.hasAnyGroup("advisor", "supervisor")) {
                throw new ResourceInvalidParametersException("User is not an advisor");
            }

            saveThesisRole(thesis, assigner, advisor, ThesisRoleName.ADVISOR, i);
        }

        for (int i = 0; i < students.size(); i++) {
            User student = students.get(i);
            saveThesisRole(thesis, assigner, student, ThesisRoleName.STUDENT, i);
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

    private void saveThesisRole(Thesis thesis, User assigner, User user, ThesisRoleName role, int position) {
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
        thesisRole.setPosition(position);

        thesisRoleRepository.save(thesisRole);

        List<ThesisRole> roles = thesis.getRoles();

        roles.add(thesisRole);
        roles.sort(Comparator.comparingInt(ThesisRole::getPosition));

        thesis.setRoles(roles);
    }
}
