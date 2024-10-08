package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ApplicationReviewer;
import thesistrack.ls1.entity.ThesisStateChange;
import thesistrack.ls1.entity.key.ApplicationReviewerId;
import thesistrack.ls1.entity.key.ThesisStateChangeId;


@Repository
public interface ApplicationReviewerRepository extends JpaRepository<ApplicationReviewer, ApplicationReviewerId> {
}
