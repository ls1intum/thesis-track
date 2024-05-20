package thesistrack.ls1.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum StudyDegree {
    BACHELOR("Bachelor"), MASTER("Master");

    private String value;
}
