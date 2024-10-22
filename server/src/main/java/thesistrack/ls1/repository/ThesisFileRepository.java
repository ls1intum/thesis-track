package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ThesisFeedback;
import thesistrack.ls1.entity.ThesisFile;

import java.util.UUID;


@Repository
public interface ThesisFileRepository extends JpaRepository<ThesisFile, UUID> {
}
