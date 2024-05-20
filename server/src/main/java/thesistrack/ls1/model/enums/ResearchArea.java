package thesistrack.ls1.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ResearchArea {
    EDUCATION_TECHNOLOGIES("Education Technologies"),
    HUMAN_COMPUTER_INTERACTION("Human Computer Interaction"),
    ROBOTIC("Robotic"),
    SOFTWARE_ENGINEERING("Software Engineering");

    private String value;
}
