package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ThesisPresentation;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface ThesisPresentationRepository extends JpaRepository<ThesisPresentation, UUID> {
    @Query("SELECT p FROM ThesisPresentation p WHERE p.scheduledAt >= :time")
    Page<ThesisPresentation> findFuturePresentations(@Param("time") Instant time, Pageable page);
}
