package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.constants.ThesisState;
import thesistrack.ls1.entity.Thesis;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ThesisRepository extends JpaRepository<Thesis, UUID> {
    @Query("SELECT DISTINCT t FROM Thesis t LEFT JOIN ThesisRole r ON (t.id = r.thesis.id) WHERE " +
            "(:userId IS NULL OR r.user.id = :userId) AND " +
            "(:states IS NULL OR t.state IN :states) AND " +
            "(:searchQuery IS NULL OR LOWER(t.title) LIKE %:searchQuery% OR " +
            "LOWER(r.user.firstName) LIKE %:searchQuery% OR " +
            "LOWER(r.user.lastName) LIKE %:searchQuery% OR " +
            "LOWER(r.user.email) LIKE %:searchQuery% OR " +
            "LOWER(r.user.matriculationNumber) LIKE %:searchQuery% OR " +
            "LOWER(r.user.universityId) LIKE %:searchQuery%)")
    Page<Thesis> searchTheses(
            @Param("userId") UUID userId,
            @Param("searchQuery") String searchQuery,
            @Param("states") Set<ThesisState> states,
            Pageable page
    );
}
