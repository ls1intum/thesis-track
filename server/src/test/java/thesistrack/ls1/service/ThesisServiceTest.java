package thesistrack.ls1.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.*;
import thesistrack.ls1.entity.*;
import thesistrack.ls1.exception.request.ResourceInvalidParametersException;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.mock.EntityMockFactory;
import thesistrack.ls1.repository.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThesisServiceTest {
    @Mock private ThesisRoleRepository thesisRoleRepository;
    @Mock private ThesisRepository thesisRepository;
    @Mock private ThesisStateChangeRepository thesisStateChangeRepository;
    @Mock private UserRepository userRepository;
    @Mock private UploadService uploadService;
    @Mock private ThesisProposalRepository thesisProposalRepository;
    @Mock private ThesisAssessmentRepository thesisAssessmentRepository;
    @Mock private MailingService mailingService;
    @Mock private AccessManagementService accessManagementService;
    @Mock private ThesisPresentationService thesisPresentationService;
    @Mock private ThesisFeedbackRepository thesisFeedbackRepository;
    @Mock private ThesisFileRepository thesisFileRepository;

    private ThesisService thesisService;
    private User testUser;
    private Thesis testThesis;

    @BeforeEach
    void setUp() {
        thesisService = new ThesisService(
                thesisRoleRepository, thesisRepository, thesisStateChangeRepository,
                userRepository, thesisProposalRepository, thesisAssessmentRepository,
                uploadService, mailingService, accessManagementService,
                thesisPresentationService, thesisFeedbackRepository, thesisFileRepository
        );

        testUser = EntityMockFactory.createUser("Test");
        testThesis = EntityMockFactory.createThesis("Test Thesis");

        EntityMockFactory.setupThesisRole(testThesis, testUser, ThesisRoleName.SUPERVISOR);
    }

    @Test
    void createThesis_WithValidData_CreatesThesis() {
        User supervisor = EntityMockFactory.createUserWithGroup("Supervisor", "supervisor");
        User advisor = EntityMockFactory.createUserWithGroup("Advisor", "advisor");
        User student = EntityMockFactory.createUserWithGroup("Student", "student");

        List<UUID> supervisorIds = new ArrayList<>(List.of(supervisor.getId()));
        List<UUID> advisorIds = new ArrayList<>(List.of(advisor.getId()));
        List<UUID> studentIds = new ArrayList<>(List.of(student.getId()));

        when(userRepository.findAllById(supervisorIds)).thenReturn(new ArrayList<>(List.of(supervisor)));
        when(userRepository.findAllById(advisorIds)).thenReturn(new ArrayList<>(List.of(advisor)));
        when(userRepository.findAllById(studentIds)).thenReturn(new ArrayList<>(List.of(student)));
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = thesisService.createThesis(
                testUser,
                "Test Thesis",
                "Bachelor",
                supervisorIds,
                advisorIds,
                studentIds,
                null,
                true
        );

        assertNotNull(result);
        assertEquals("Test Thesis", result.getTitle());
        assertEquals("Bachelor", result.getType());
        verify(thesisRepository).save(any(Thesis.class));
        verify(mailingService).sendThesisCreatedEmail(any(), eq(result));
        verify(accessManagementService).addStudentGroup(eq(student));
    }

    @Test
    void submitThesis_WithoutFile_ThrowsException() {
        testThesis.setFiles(new ArrayList<>());

        assertThrows(ResourceInvalidParametersException.class, () ->
                thesisService.submitThesis(testThesis)
        );
    }

    @Test
    void submitThesis_WithValidFile_SubmitsThesis() {
        ThesisFile file = new ThesisFile();
        file.setType("THESIS");
        testThesis.setFiles(List.of(file));
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = thesisService.submitThesis(testThesis);

        assertEquals(ThesisState.SUBMITTED, result.getState());
        verify(thesisRepository).save(testThesis);
        verify(mailingService).sendFinalSubmissionEmail(testThesis);
    }

    @Test
    void uploadProposal_WithValidFile_UploadsProposal() {
        MultipartFile file = new MockMultipartFile(
                "proposal",
                "proposal.pdf",
                "application/pdf",
                "test content".getBytes()
        );
        when(uploadService.store(any(), any(), any())).thenReturn("stored-file");
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = thesisService.uploadProposal(testUser, testThesis, file);

        assertNotNull(result);
        verify(uploadService).store(eq(file), any(), eq(UploadFileType.PDF));
        verify(thesisProposalRepository).save(any(ThesisProposal.class));
        verify(mailingService).sendProposalUploadedEmail(any(ThesisProposal.class));
    }

    @Test
    void acceptProposal_WithNoProposal_ThrowsException() {
        testThesis.setProposals(new ArrayList<>());

        assertThrows(ResourceNotFoundException.class, () ->
                thesisService.acceptProposal(testUser, testThesis)
        );
    }

    @Test
    void acceptProposal_WithValidProposal_AcceptsProposal() {
        ThesisProposal proposal = new ThesisProposal();
        testThesis.setProposals(List.of(proposal));
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = thesisService.acceptProposal(testUser, testThesis);

        assertEquals(ThesisState.WRITING, result.getState());
        verify(thesisProposalRepository).save(any(ThesisProposal.class));
        verify(mailingService).sendProposalAcceptedEmail(any(ThesisProposal.class));
    }

    @Test
    void submitAssessment_WithValidData_CreatesAssessment() {
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = thesisService.submitAssessment(
                testUser,
                testThesis,
                "Summary",
                "Positives",
                "Negatives",
                "A"
        );

        assertEquals(ThesisState.ASSESSED, result.getState());
        verify(thesisAssessmentRepository).save(any(ThesisAssessment.class));
        verify(mailingService).sendAssessmentAddedEmail(any(ThesisAssessment.class));
    }

    @Test
    void gradeThesis_WithValidData_GradesThesis() {
        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Thesis result = thesisService.gradeThesis(
                testThesis,
                "A",
                "Great work",
                ThesisVisibility.INTERNAL
        );

        assertEquals(ThesisState.GRADED, result.getState());
        assertEquals("A", result.getFinalGrade());
        assertEquals("Great work", result.getFinalFeedback());
        assertEquals(ThesisVisibility.INTERNAL, result.getVisibility());
        verify(thesisRepository).save(testThesis);
        verify(mailingService).sendFinalGradeEmail(testThesis);
    }

    @Test
    void completeThesis_RemovesStudentGroupIfNoOtherTheses() {
        User student = EntityMockFactory.createUserWithGroup("Student", "student");
        EntityMockFactory.setupThesisRole(testThesis, student, ThesisRoleName.STUDENT);

        when(thesisRepository.save(any(Thesis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(thesisRepository.searchTheses(
                any(), any(), any(), any(), any(), any()
        )).thenReturn(new PageImpl<>(Collections.emptyList()));

        Thesis result = thesisService.completeThesis(testThesis);

        assertEquals(ThesisState.FINISHED, result.getState());
        verify(thesisRepository).save(testThesis);
        verify(accessManagementService).removeStudentGroup(student);
    }
}