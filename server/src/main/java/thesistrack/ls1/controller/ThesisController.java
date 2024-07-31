package thesistrack.ls1.controller;

import com.nimbusds.jose.util.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import thesistrack.ls1.dto.PageResponse;
import thesistrack.ls1.dto.ThesisDto;
import thesistrack.ls1.service.ThesisService;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/theses")
public class ThesisController {
    private final ThesisService thesisService;

    @Autowired
    public ThesisController(ThesisService thesisService) {
        this.thesisService = thesisService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ThesisDto>> getTheses() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping
    public ResponseEntity<ThesisDto> createThesis() {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}")
    public ResponseEntity<ThesisDto> updateThesisConfig(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @DeleteMapping("/{thesisId}")
    public ResponseEntity<ThesisDto> closeThesis(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/info")
    public ResponseEntity<ThesisDto> updateThesisInfo(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/presentation")
    public ResponseEntity<Resource> getLastPresentationUpload(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/presentation")
    public ResponseEntity<ThesisDto> uploadPresentation(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/thesis")
    public ResponseEntity<Resource> getThesisFile(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/thesis")
    public ResponseEntity<ThesisDto> uploadThesis(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/proposal")
    public ResponseEntity<Resource> getProposalFile(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PutMapping("/{thesisId}/proposal")
    public ResponseEntity<ThesisDto> uploadProposal(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/proposal/accept")
    public ResponseEntity<ThesisDto> acceptProposal(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/proposal/reject")
    public ResponseEntity<ThesisDto> rejectProposal(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/presentations")
    public ResponseEntity<ThesisDto> createPresentation(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @DeleteMapping("/{thesisId}/presentations/{presentationId}")
    public ResponseEntity<ThesisDto> deletePresentation(@PathVariable UUID thesisId, @PathVariable UUID presentationId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/comments")
    public ResponseEntity<Page<ThesisDto>> getComments(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/comments")
    public ResponseEntity<ThesisDto> createComment(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @GetMapping("/{thesisId}/comments/{fileId}")
    public ResponseEntity<ThesisDto> getCommentFile(@PathVariable UUID thesisId, @PathVariable String fileId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/assessment")
    public ResponseEntity<ThesisDto> createAssessment(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/grade")
    public ResponseEntity<ThesisDto> addGrade(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }

    @PostMapping("/{thesisId}/complete")
    public ResponseEntity<ThesisDto> completeThesis(@PathVariable UUID thesisId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "This feature is not implemented yet");
    }
}
