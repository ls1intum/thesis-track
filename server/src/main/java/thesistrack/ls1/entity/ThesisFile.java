package thesistrack.ls1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "thesis_files")
public class ThesisFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "file_id", nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;

    @NotNull
    @Column(name = "type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "filename", nullable = false)
    private String filename;

    @NotNull
    @Column(name = "upload_name", nullable = false)
    private String uploadName;

    @NotNull
    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

}