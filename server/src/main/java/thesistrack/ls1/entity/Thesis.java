package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.dto.LightUserDto;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@Entity
@Table(name = "theses")
public class Thesis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "thesis_id", nullable = false)
    private UUID id;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "info", nullable = false)
    private String info;

    @NotNull
    @Column(name = "abstract", nullable = false)
    private String abstractField;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private ThesisState state;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    private ThesisVisibility visibility;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "keywords", columnDefinition = "text[]")
    private Set<String> keywords = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    @Column(name = "final_thesis_filename")
    private String finalThesisFilename;

    @Column(name = "final_presentation_filename")
    private String finalPresentationFilename;

    @Column(name = "final_grade")
    private String finalGrade;

    @Column(name = "final_feedback")
    private String finalFeedback;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "thesis", fetch = FetchType.EAGER)
    @OrderBy("position ASC")
    private List<ThesisRole> roles = new ArrayList<>();

    @OneToMany(mappedBy = "thesis", fetch = FetchType.EAGER)
    @OrderBy("createdAt DESC")
    private List<ThesisProposal> proposals = new ArrayList<>();

    @OneToMany(mappedBy = "thesis", fetch = FetchType.EAGER)
    @OrderBy("createdAt DESC")
    private List<ThesisAssessment> assessments = new ArrayList<>();

    @OneToMany(mappedBy = "thesis", fetch = FetchType.EAGER)
    @OrderBy("scheduledAt ASC")
    private List<ThesisPresentation> presentations = new ArrayList<>();

    @OneToMany(mappedBy = "thesis", fetch = FetchType.EAGER)
    private Set<ThesisStateChange> states = new HashSet<>();

    public List<User> getStudents() {
        List<User> result = new ArrayList<>();

        for (ThesisRole role : getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.STUDENT) {
                result.add(role.getUser());
            }
        }

        return result;
    }

    public List<User> getAdvisors() {
        List<User> result = new ArrayList<>();

        for (ThesisRole role : getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.ADVISOR) {
                result.add(role.getUser());
            }
        }

        return result;
    }

    public List<User> getSupervisors() {
        List<User> result = new ArrayList<>();

        for (ThesisRole role : getRoles()) {
            if (role.getId().getRole() == ThesisRoleName.SUPERVISOR) {
                result.add(role.getUser());
            }
        }

        return result;
    }

    public boolean hasSupervisorAccess(User user) {
        if (user == null) {
            return false;
        }

        if (user.hasAnyGroup("admin")) {
            return true;
        }

        for (ThesisRole role : roles) {
            if (
                    role.getId().getRole().equals(ThesisRoleName.SUPERVISOR) &&
                    user.hasAnyGroup("supervisor") &&
                    role.getUser().getId().equals(user.getId())
            ) {
                return true;
            }
        }

        return false;
    }

    public boolean hasAdvisorAccess(User user) {
        if (user == null) {
            return false;
        }

        if (hasSupervisorAccess(user)) {
            return true;
        }

        for (ThesisRole role : roles) {
            if (
                    role.getId().getRole().equals(ThesisRoleName.ADVISOR) &&
                    user.hasAnyGroup("advisor") &&
                    role.getUser().getId().equals(user.getId())
            ) {
                return true;
            }
        }

        return false;
    }

    public boolean hasStudentAccess(User user) {
        if (user == null) {
            return false;
        }

        if (hasAdvisorAccess(user)) {
            return true;
        }

        for (ThesisRole role : roles) {
            if (role.getId().getRole().equals(ThesisRoleName.STUDENT) && role.getUser().getId().equals(user.getId())) {
                return true;
            }
        }

        return false;
    }

    public boolean hasReadAccess(User user) {
        if (visibility == ThesisVisibility.PUBLIC && state == ThesisState.FINISHED) {
            return true;
        }

        if (user == null) {
            return false;
        }

        if (hasStudentAccess(user)) {
            return true;
        }

        if (visibility.equals(ThesisVisibility.PUBLIC)) {
            return true;
        }

        if (visibility.equals(ThesisVisibility.INTERNAL) && user.hasAnyGroup("advisor", "supervisor")) {
            return true;
        }

        if (visibility.equals(ThesisVisibility.STUDENT) && user.hasAnyGroup("student", "advisor", "supervisor")) {
            return true;
        }

        return false;
    }
}