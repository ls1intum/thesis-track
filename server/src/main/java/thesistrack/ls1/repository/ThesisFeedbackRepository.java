package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ThesisFeedback;

import java.util.UUID;


@Repository
public interface ThesisFeedbackRepository extends JpaRepository<ThesisFeedback, UUID> {
}
