package thesistrack.ls1.entity.jsonb;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public record ThesisMetadata(
        Map<String, String> titles,
        Map<UUID, Number> credits
) {
    public static ThesisMetadata getEmptyMetadata() {
        return new ThesisMetadata(
                new HashMap<>(),
                new HashMap<>()
        );
    }

    public ThesisMetadata(
            Map<String, String> titles,
            Map<UUID, Number> credits
    ) {
        this.titles = titles == null ? new HashMap<>() : titles;
        this.credits = credits == null ? new HashMap<>() : credits;
    }
}
