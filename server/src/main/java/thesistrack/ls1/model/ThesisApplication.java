package thesistrack.ls1.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import thesistrack.ls1.model.enums.ApplicationStatus;
import thesistrack.ls1.model.enums.FocusTopic;
import thesistrack.ls1.model.enums.ResearchArea;
import thesistrack.ls1.model.enums.StudyDegree;
import thesistrack.ls1.model.enums.StudyProgram;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table
@org.hibernate.annotations.NamedQueries({
        @org.hibernate.annotations.NamedQuery(
                name = "ThesisApplication.findAllNotAssessed",
                query = "SELECT ta FROM ThesisApplication ta " +
                        "WHERE ta.applicationStatus = thesistrack.ls1.model.enums.ApplicationStatus.NOT_ASSESSED"
        )
})
public class ThesisApplication implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    @Min(1)
    @Max(99)
    private Short currentSemester;

    @Enumerated(EnumType.STRING)
    private StudyDegree studyDegree;

    @Enumerated(EnumType.STRING)
    private StudyProgram studyProgram;

    @Column(columnDefinition = "DATE")
    private Date desiredThesisStart;

    private String thesisTitle;

    @Column(length = 1000)
    private String interests;

    @Column(length = 1000)
    private String projects;

    @Column(length = 1000)
    private String specialSkills;

    @Column(length = 500)
    private String motivation;

    @Enumerated(EnumType.STRING)
    private Set<ResearchArea> researchAreas;

    @Enumerated(EnumType.STRING)
    private Set<FocusTopic> focusTopics;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus applicationStatus;

    @Column(length = 2000)
    private String assessmentComment;

    private String examinationReportFilename;

    private String cvFilename;

    private String bachelorReportFilename;

    @ManyToOne
    @JoinColumn(name = "thesis_advisor_id")
    private ThesisAdvisor thesisAdvisor;
}
