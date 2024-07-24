package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", nullable = false)
    private UUID id;

    @NotNull
    @Column(name = "university_id", nullable = false, length = 100)
    private String universityId;

    @Column(name = "matriculation_number", length = 100)
    private String matriculationNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "gender", length = 100)
    private String gender;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "is_exchange_student")
    private Boolean isExchangeStudent;

    @Column(name = "cv_filename", length = 200)
    private String cvFilename;

    @Column(name = "degree_filename", length = 200)
    private String degreeFilename;

    @Column(name = "examination_filename", length = 200)
    private String examinationFilename;

    @Column(name = "focus_topics")
    private List<String> focusTopics;

    @Column(name = "research_areas")
    private List<String> researchAreas;

    @Column(name = "study_degree", length = 100)
    private String studyDegree;

    @Column(name = "study_program", length = 100)
    private String studyProgram;

    @Column(name = "projects", length = 2000)
    private String projects;

    @Column(name = "interests", length = 2000)
    private String interests;

    @Column(name = "special_skills", length = 2000)
    private String specialSkills;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;

    @UpdateTimestamp
    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreationTimestamp
    @NotNull
    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

}