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

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TopicRepository  extends JpaRepository<Topic, UUID>  {
    @Query(value =
            "SELECT t.* FROM topics t WHERE " +
            "(:searchQuery IS NULL OR t.title ILIKE CONCAT('%', :searchQuery, '%')) AND " +
            "(CAST(:types AS TEXT[]) IS NULL OR t.thesis_types && CAST(:types AS TEXT[])) AND " +
            "(:includeClosed = TRUE OR t.closed_at IS NULL)",
            nativeQuery = true
    )
    Page<Topic> searchTopics(
            @Param("types") String[] types,
            @Param("includeClosed") boolean includeClosed,
            @Param("searchQuery") String searchQuery,
            Pageable page
    );

    @Query("SELECT COUNT(*) FROM Topic t WHERE t.closedAt IS NULL")
    long countOpenTopics();
}
