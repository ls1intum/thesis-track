package thesistrack.ls1.controller.payload;

import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
public class AcceptApplicationPayload {
    private String thesisTitle;
    private List<UUID> advisorIds;
    private List<UUID> supervisorIds;
    private String comment;
    private Boolean notifyUser;
    private Boolean closeTopic;
}
