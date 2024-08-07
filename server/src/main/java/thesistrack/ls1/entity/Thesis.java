package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import thesistrack.ls1.constants.ThesisRoleName;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

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
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @NotNull
    @Column(name = "info", nullable = false, length = 1000)
    private String info;

    @NotNull
    @Column(name = "abstract", nullable = false, length = 1000)
    private String abstractField;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 100)
    private ThesisState state;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 100)
    private ThesisVisibility visibility;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    @Column(name = "final_thesis_filename", length = 200)
    private String finalThesisFilename;

    @Column(name = "final_presentation_filename", length = 200)
    private String finalPresentationFilename;

    @Column(name = "final_grade", length = 10)
    private String finalGrade;

    @Column(name = "final_feedback", length = 2000)
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
    private Set<ThesisRole> roles = Set.of();

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
    private Set<ThesisStateChange> states = Set.of();

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
        if (user == null && visibility == ThesisVisibility.PUBLIC) {
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

        if (visibility.equals(ThesisVisibility.INTERNAL) && user.hasAnyGroup("advisor", "supervisor", "student")) {
            return true;
        }

        return false;
    }
}