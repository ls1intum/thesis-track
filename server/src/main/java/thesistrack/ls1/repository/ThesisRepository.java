package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.Thesis;

import java.util.UUID;

@Repository
public interface ThesisRepository extends JpaRepository<Thesis, UUID> {
}
