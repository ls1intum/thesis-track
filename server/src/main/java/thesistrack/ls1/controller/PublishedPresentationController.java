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
import thesistrack.ls1.dto.PublishedPresentationDto;
import thesistrack.ls1.dto.PublishedThesisDto;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisPresentation;
import thesistrack.ls1.service.ThesisPresentationService;
import thesistrack.ls1.service.ThesisService;

import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v2/published-presentations")
public class PublishedPresentationController {
    private final ThesisPresentationService thesisPresentationService;

    @Autowired
    public PublishedPresentationController(ThesisPresentationService thesisPresentationService) {
        this.thesisPresentationService = thesisPresentationService;
    }

    @GetMapping()
    public ResponseEntity<PaginationDto<PublishedPresentationDto>> getPresentations(
            @RequestParam(required = false, defaultValue = "false") Boolean includeDrafts,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "scheduledAt") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder
    ) {
        Page<ThesisPresentation> presentations = thesisPresentationService.getPublicPresentations(
                includeDrafts,
                page,
                limit,
                sortBy,
                sortOrder
        );

        return ResponseEntity.ok(PaginationDto.fromSpringPage(
                presentations.map(PublishedPresentationDto::fromPresentationEntity)
        ));
    }

    @GetMapping("/{presentationId}")
    public ResponseEntity<PublishedPresentationDto> getPresentation(
            @PathVariable UUID presentationId
    ) {
        ThesisPresentation presentation = thesisPresentationService.getPublicPresentation(presentationId);

        return ResponseEntity.ok(PublishedPresentationDto.fromPresentationEntity(presentation));
    }
}
