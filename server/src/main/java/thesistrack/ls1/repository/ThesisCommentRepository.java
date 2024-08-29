package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.constants.ThesisCommentType;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.constants.ThesisVisibility;
import thesistrack.ls1.entity.Thesis;
import thesistrack.ls1.entity.ThesisComment;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ThesisCommentRepository extends JpaRepository<ThesisComment, UUID> {
    @Query(
            "SELECT DISTINCT c FROM ThesisComment c WHERE " +
            "c.thesis.id = :thesisId AND c.type = :commentType " +
            "ORDER BY c.createdAt DESC"
    )
    Page<ThesisComment> searchComments(
            @Param("thesisId") UUID thesisId,
            @Param("commentType") ThesisCommentType commentType,
            Pageable page
    );
}
