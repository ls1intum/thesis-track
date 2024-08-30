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

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_data", columnDefinition = "jsonb")
    private Map<String, String> customData = new HashMap<>();

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

    public String getAvatar() {
        if (email == null) {
            return null;
        }

        try {
            MessageDigest md = MessageDigest.getInstance("MD5");

            byte[] hashInBytes = md.digest(email.trim().toLowerCase().getBytes());

            StringBuilder sb = new StringBuilder();

            for (byte b : hashInBytes) {
                sb.append(String.format("%02x", b));
            }

            return "https://www.gravatar.com/avatar/" + sb;
        } catch (NoSuchAlgorithmException e) {
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