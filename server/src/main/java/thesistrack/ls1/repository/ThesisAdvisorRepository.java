package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.model.ThesisAdvisor;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThesisAdvisorRepository extends JpaRepository<ThesisAdvisor, UUID> {
    Optional<ThesisAdvisor> findByTumId(final String tumId);
}
