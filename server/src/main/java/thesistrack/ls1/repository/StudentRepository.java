package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import thesistrack.ls1.entity.legacy.Student;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {

    Optional<Student> findByTumId(final String tumId);

    Optional<Student> findByEmail(final String email);

    @Transactional
    @Query(value="select s from Student s where s.tumId=?1 or s.matriculationNumber=?2")
    Optional<Student> findByTumIdOrMatriculationNumber(final String tumId, final String matriculationNumber);
}
