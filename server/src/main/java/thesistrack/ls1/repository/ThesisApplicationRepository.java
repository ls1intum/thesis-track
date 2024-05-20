package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.model.ThesisApplication;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThesisApplicationRepository extends JpaRepository<ThesisApplication, UUID> {
    @Transactional
    List<ThesisApplication> findAllNotAssessed();
}
