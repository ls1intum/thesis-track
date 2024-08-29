package thesistrack.ls1.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thesistrack.ls1.service.*;

@Slf4j
@RestController
@RequestMapping("/v2/calendar")
public class CalendarController {
    private final ThesisPresentationService thesisPresentationService;

    @Autowired
    public CalendarController(ThesisPresentationService thesisPresentationService) {
        this.thesisPresentationService = thesisPresentationService;
    }

    @GetMapping("/presentations")
    public ResponseEntity<String> getCalendar() {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/calendar"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=calendar.ics")
                .body(thesisPresentationService.getPresentationCalendar().toString());
    }
}
