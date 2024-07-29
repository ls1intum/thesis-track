package thesistrack.ls1.controller.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LegacyAcceptApplicationPayload implements Serializable {
    private String comment;
    private Boolean notifyUser;
    private UUID advisorId;
}
