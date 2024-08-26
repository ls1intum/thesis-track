package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.Topic;

import java.util.Set;
import java.util.UUID;

@Repository
public interface TopicRepository  extends JpaRepository<Topic, UUID>  {
    @Query("SELECT DISTINCT t FROM Topic t WHERE " +
            "(:searchQuery IS NULL OR t.title LIKE %:searchQuery%) AND " +
            "(:includeClosed = TRUE OR t.closedAt IS NULL)")
    Page<Topic> searchTopics(
            @Param("includeClosed") boolean includeClosed,
            @Param("searchQuery") String searchQuery,
            Pageable page
    );
}
