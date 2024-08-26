package thesistrack.ls1.entity;

import jakarta.mail.internet.InternetAddress;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.*;

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
    @Column(name = "university_id", nullable = false)
    private String universityId;

    @Column(name = "matriculation_number")
    private String matriculationNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "gender")
    private String gender;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "is_exchange_student")
    private Boolean isExchangeStudent;

    @Column(name = "cv_filename")
    private String cvFilename;

    @Column(name = "degree_filename")
    private String degreeFilename;

    @Column(name = "examination_filename")
    private String examinationFilename;

    @Column(name = "study_degree")
    private String studyDegree;

    @Column(name = "study_program")
    private String studyProgram;

    @Column(name = "projects")
    private String projects;

    @Column(name = "interests")
    private String interests;

    @Column(name = "special_skills")
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
    private Set<UserGroup> groups = new HashSet<>();

    public InternetAddress getEmail() {
        try {
            return new InternetAddress(email);
        } catch (Exception e) {
            return null;
        }
    }

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

    public boolean hasFullAccess(User user) {
        if (user.hasAnyGroup("admin", "supervisor", "advisor")) {
            return true;
        }

        return id.equals(user.getId());
    }
}