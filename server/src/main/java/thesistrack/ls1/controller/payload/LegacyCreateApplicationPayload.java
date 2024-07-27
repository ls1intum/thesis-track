package thesistrack.ls1.controller.payload;

import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LegacyCreateApplicationPayload {
    private String universityId;
    private String matriculationNumber;
    private String firstName;
    private String lastName;
    private String gender;
    private String nationality;
    private String email;
    private String studyDegree;
    private String studyProgram;
    private Instant enrolledAt;
    private String specialSkills;
    private String motivation;
    private String interests;
    private String projects;
    private String thesisTitle;
    private Instant desiredStartDate;
    private List<String> researchAreas;
    private List<String> focusTopics;
}
