package thesistrack.ls1.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.constants.ThesisCommentType;
import thesistrack.ls1.constants.UploadFileType;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisComment;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.mock.EntityMockFactory;
import thesistrack.ls1.repository.ThesisCommentRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThesisCommentServiceTest {
    @Mock
    private ThesisCommentRepository thesisCommentRepository;

    @Mock
    private UploadService uploadService;

    @Mock
    private MailingService mailingService;

    @Mock
    private FileSystemResource mockResource;

    private ThesisCommentService commentService;
    private User testUser;
    private Thesis testThesis;
    private ThesisComment testComment;

    @BeforeEach
    void setUp() {
        commentService = new ThesisCommentService(
                thesisCommentRepository,
                uploadService,
                mailingService
        );

        testUser = EntityMockFactory.createUser("Test");
        testThesis = EntityMockFactory.createThesis("Test Thesis");

        testComment = new ThesisComment();
        testComment.setId(UUID.randomUUID());
        testComment.setThesis(testThesis);
        testComment.setCreatedBy(testUser);
        testComment.setMessage("Test Comment");
        testComment.setType(ThesisCommentType.THESIS);
        testComment.setCreatedAt(Instant.now());
    }

    @Test
    void getComments_ReturnsPageOfComments() {
        Page<ThesisComment> expectedPage = new PageImpl<>(List.of(testComment));
        when(thesisCommentRepository.searchComments(
                eq(testThesis.getId()),
                eq(ThesisCommentType.THESIS),
                any(PageRequest.class)
        )).thenReturn(expectedPage);

        Page<ThesisComment> result = commentService.getComments(
                testThesis,
                ThesisCommentType.THESIS,
                0,
                10
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testComment, result.getContent().getFirst());
        verify(thesisCommentRepository).searchComments(
                eq(testThesis.getId()),
                eq(ThesisCommentType.THESIS),
                any(PageRequest.class)
        );
    }

    @Test
    void postComment_WithoutFile_CreatesComment() {
        when(thesisCommentRepository.save(any(ThesisComment.class))).thenAnswer(invocation -> {
            ThesisComment savedComment = invocation.getArgument(0);
            savedComment.setId(UUID.randomUUID());
            return savedComment;
        });

        ThesisComment result = commentService.postComment(
                testUser,
                testThesis,
                ThesisCommentType.THESIS,
                "Test Message",
                null
        );

        assertNotNull(result);
        assertEquals("Test Message", result.getMessage());
        assertEquals(testUser, result.getCreatedBy());
        assertEquals(testThesis, result.getThesis());
        assertEquals(ThesisCommentType.THESIS, result.getType());
        assertNull(result.getFilename());
        verify(thesisCommentRepository).save(any(ThesisComment.class));
        verify(mailingService).sendNewCommentEmail(result);
        verify(uploadService, never()).store(any(), any(), any());
    }

    @Test
    void postComment_WithFile_CreatesCommentWithFile() {
        MultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "test content".getBytes()
        );
        when(thesisCommentRepository.save(any(ThesisComment.class))).thenAnswer(invocation -> {
            ThesisComment savedComment = invocation.getArgument(0);
            savedComment.setId(UUID.randomUUID());
            return savedComment;
        });
        when(uploadService.store(any(), any(), any())).thenReturn("stored-file-name");

        ThesisComment result = commentService.postComment(
                testUser,
                testThesis,
                ThesisCommentType.THESIS,
                "Test Message",
                file
        );

        assertNotNull(result);
        assertEquals("Test Message", result.getMessage());
        assertEquals("stored-file-name", result.getFilename());
        verify(uploadService).store(eq(file), any(), eq(UploadFileType.ANY));
        verify(thesisCommentRepository).save(any(ThesisComment.class));
        verify(mailingService).sendNewCommentEmail(result);
    }

    @Test
    void getCommentFile_ReturnsResource() {
        testComment.setFilename("test-file.pdf");
        when(uploadService.load("test-file.pdf")).thenReturn(mockResource);

        Resource result = commentService.getCommentFile(testComment);

        assertNotNull(result);
        assertEquals(mockResource, result);
        verify(uploadService).load("test-file.pdf");
    }

    @Test
    void deleteComment_DeletesComment() {
        doNothing().when(thesisCommentRepository).deleteById(testComment.getId());

        ThesisComment result = commentService.deleteComment(testComment);

        assertNotNull(result);
        assertEquals(testComment, result);
        verify(thesisCommentRepository).deleteById(testComment.getId());
    }

    @Test
    void findById_WithValidIds_ReturnsComment() {
        when(thesisCommentRepository.findById(testComment.getId()))
                .thenReturn(Optional.of(testComment));

        ThesisComment result = commentService.findById(testThesis.getId(), testComment.getId());

        assertNotNull(result);
        assertEquals(testComment, result);
    }

    @Test
    void findById_WithInvalidCommentId_ThrowsException() {
        UUID invalidId = UUID.randomUUID();
        when(thesisCommentRepository.findById(invalidId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                commentService.findById(testThesis.getId(), invalidId)
        );
    }

    @Test
    void findById_WithMismatchedThesisId_ThrowsException() {
        UUID differentThesisId = UUID.randomUUID();
        when(thesisCommentRepository.findById(testComment.getId()))
                .thenReturn(Optional.of(testComment));

        assertThrows(ResourceNotFoundException.class, () ->
                commentService.findById(differentThesisId, testComment.getId())
        );
    }

    @Test
    void postComment_WithLargeFile_StoresWithLimit() {
        MultipartFile file = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                new byte[1024 * 1024]
        );
        when(thesisCommentRepository.save(any(ThesisComment.class))).thenAnswer(invocation -> {
            ThesisComment savedComment = invocation.getArgument(0);
            savedComment.setId(UUID.randomUUID());
            return savedComment;
        });
        when(uploadService.store(any(), any(), any())).thenReturn("stored-large-file");

        ThesisComment result = commentService.postComment(
                testUser,
                testThesis,
                ThesisCommentType.THESIS,
                "Large File Comment",
                file
        );

        assertNotNull(result);
        assertEquals("stored-large-file", result.getFilename());
        verify(uploadService).store(eq(file), any(), eq(UploadFileType.ANY));
    }
}