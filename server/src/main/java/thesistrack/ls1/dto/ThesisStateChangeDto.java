package thesistrack.ls1.dto;

import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.entity.ThesisStateChange;

import java.time.Instant;

public record ThesisStateChangeDto(
        ThesisState state,
        Instant startedAt,
        Instant endedAt
) {
    public static ThesisStateChangeDto fromStateChangeEntity(ThesisStateChange stateChange, Instant endedAt) {
        if (stateChange == null) {
            return null;
        }

        return new ThesisStateChangeDto(
                stateChange.getId().getState(),
                stateChange.getChangedAt(),
                endedAt
        );
    }
}
