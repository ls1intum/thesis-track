package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ThesisProposalFeedback;
import thesistrack.ls1.entity.ThesisStateChange;
import thesistrack.ls1.entity.key.ThesisStateChangeId;

import java.util.UUID;


@Repository
public interface ThesisProposalFeedbackRepository extends JpaRepository<ThesisProposalFeedback, UUID> {
}
