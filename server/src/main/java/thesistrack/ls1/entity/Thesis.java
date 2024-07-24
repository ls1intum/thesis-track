package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
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
    @Column(name = "info", nullable = false, length = 2000)
    private String info;

    @NotNull
    @Column(name = "abstract", nullable = false, length = 2000)
    private String abstractField;

    @NotNull
    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    @Column(name = "final_thesis_filename", length = 200)
    private String finalThesisFilename;

    @Column(name = "final_presentation_filename", length = 200)
    private String finalPresentationFilename;

    @Column(name = "final_grade", length = 10)
    private String finalGrade;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @CreationTimestamp
    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

}