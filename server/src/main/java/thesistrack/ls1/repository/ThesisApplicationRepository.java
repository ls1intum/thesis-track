package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.model.ThesisApplication;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ThesisApplicationRepository extends JpaRepository<ThesisApplication, UUID> {
    @Query("SELECT ta FROM ThesisApplication ta WHERE " +
            "(ta.applicationStatus IN(:states)) AND " +
            "(LOWER(ta.student.firstName) LIKE %:searchQuery% OR " +
            "LOWER(ta.student.lastName) LIKE %:searchQuery% OR " +
            "LOWER(ta.student.email) LIKE %:searchQuery% OR " +
            "LOWER(ta.student.matriculationNumber) LIKE %:searchQuery% OR " +
            "LOWER(ta.student.tumId) LIKE %:searchQuery%)")
    Page<ThesisApplication> searchThesisApplications(@Param("states") Set<String> states, @Param("searchQuery") String searchQuery, final Pageable page);
}
