package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.dto.PaginationDto;
import thesistrack.ls1.dto.PublishedThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.service.ThesisService;

import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/published-theses")
public class PublishedThesisController {
    private final ThesisService thesisService;

    @Autowired
    public PublishedThesisController(ThesisService thesisService) {
        this.thesisService = thesisService;
    }

    @GetMapping
    public ResponseEntity<PaginationDto<PublishedThesisDto>> getTheses(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "endDate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder
    ) {
        Page<Thesis> theses = thesisService.getAll(
                null,
                Set.of(ThesisVisibility.PUBLIC),
                null,
                new ThesisState[]{ThesisState.FINISHED},
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(theses.map(PublishedThesisDto::fromThesisEntity)));
    }

    @GetMapping("/{thesisId}/thesis")
    public ResponseEntity<Resource> getThesisFile(
            @PathVariable UUID thesisId
    ) {
        Thesis thesis = thesisService.findById(thesisId);

        if (!thesis.hasReadAccess(null)) {
            throw new AccessDeniedException("You do not have the required permissions to view this thesis");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=thesis_%s.pdf", thesisId))
                .body(thesisService.getThesisFile(thesis));
    }
}
