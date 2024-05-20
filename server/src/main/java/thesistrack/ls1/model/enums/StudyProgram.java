package thesistrack.ls1.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum StudyProgram {
    COMPUTER_SCIENCE("Computer Science"), INFORMATION_SYSTEMS("Information Systems"),
    GAMES_ENGINEERING("Games Engineering"), MANAGEMENT_AND_TECHNOLOGY("Management and Technology"),
    OTHER("Other");

    private String value;
}
