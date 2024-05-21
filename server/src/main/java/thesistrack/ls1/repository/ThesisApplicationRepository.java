package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.model.ThesisApplication;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThesisApplicationRepository extends JpaRepository<ThesisApplication, UUID> {
    @Transactional
    List<ThesisApplication> findAllNotAssessed();

    @Query("SELECT ta FROM ThesisApplication ta WHERE " +
            "LOWER(ta.student.firstName) LIKE %?1% OR " +
            "LOWER(ta.student.lastName) LIKE %?1% OR " +
            "LOWER(ta.student.email) LIKE %?1% OR " +
            "LOWER(ta.student.matriculationNumber) LIKE %?1% OR " +
            "LOWER(ta.student.tumId) LIKE %?1%")
    Page<ThesisApplication> searchThesisApplications(final String searchQuery, final Pageable page);
}
