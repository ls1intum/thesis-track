package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
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
    @Column(name = "university_id", nullable = false, length = 30)
    private String universityId;

    @Column(name = "matriculation_number", length = 30)
    private String matriculationNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "gender", length = 20)
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

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "focus_topics", columnDefinition = "text[]")
    private Set<String> focusTopics;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "research_areas", columnDefinition = "text[]")
    private Set<String> researchAreas;

    @Column(name = "study_degree", length = 100)
    private String studyDegree;

    @Column(name = "study_program", length = 100)
    private String studyProgram;

    @Column(name = "projects", length = 1000)
    private String projects;

    @Column(name = "interests", length = 1000)
    private String interests;

    @Column(name = "special_skills", length = 1000)
    private String specialSkills;

    @Column(name = "enrolled_at")
    private Instant enrolledAt;

    @UpdateTimestamp
    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreationTimestamp
    @NotNull
    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    private List<UserGroup> groups = new ArrayList<>();

    public boolean hasAnyGroup(String...groups) {
        for (String group : groups) {
            for (UserGroup userGroup : getGroups()) {
                if (userGroup.getId().getGroup().equals(group)) {
                    return true;
                }
            }
        }

        return false;
    }
}