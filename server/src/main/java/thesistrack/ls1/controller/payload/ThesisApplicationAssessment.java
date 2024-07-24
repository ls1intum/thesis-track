package thesistrack.ls1.controller.payload;

import lombok.Getter;
import lombok.Setter;
import thesistrack.ls1.constants.ApplicationState;

@Getter
@Setter
public class ThesisApplicationAssessment {
    private ApplicationState status;
    private String assessmentComment;
}
