package thesistrack.ls1.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class CalendarService {
    public String createEvent(String title, String location, String description, Instant startDate, Number length) {
        return null;
    }

    public void deleteEvent(String eventId) {
        if (eventId == null) {
            return;
        }
    }
}
