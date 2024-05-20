package thesistrack.ls1.controller.payload;

import lombok.Getter;
import lombok.Setter;
import thesistrack.ls1.model.enums.ApplicationStatus;

@Getter
@Setter
public class ThesisApplicationAssessment {
    private ApplicationStatus status;
    private String assessmentComment;
}
