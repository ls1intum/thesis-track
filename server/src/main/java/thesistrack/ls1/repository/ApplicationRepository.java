package thesistrack.ls1.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.constants.ApplicationState;
import thesistrack.ls1.entity.Application;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    @Query("SELECT a FROM Application a WHERE " +
            "(:states IS NULL OR a.state IN :states) AND " +
            "(:searchQuery IS NULL OR LOWER(a.user.firstName) LIKE %:searchQuery% OR " +
            "LOWER(a.user.lastName) LIKE %:searchQuery% OR " +
            "LOWER(a.user.email) LIKE %:searchQuery% OR " +
            "LOWER(a.user.matriculationNumber) LIKE %:searchQuery% OR " +
            "LOWER(a.user.universityId) LIKE %:searchQuery%)")
    Page<Application> searchApplications(@Param("searchQuery") String searchQuery, @Param("states") Set<ApplicationState> states, Pageable page);
}
