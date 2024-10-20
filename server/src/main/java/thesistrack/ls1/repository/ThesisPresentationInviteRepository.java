package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ThesisFeedback;
import thesistrack.ls1.entity.ThesisPresentationInvite;
import thesistrack.ls1.entity.key.ThesisPresentationInviteId;

import java.util.UUID;


@Repository
public interface ThesisPresentationInviteRepository extends JpaRepository<ThesisPresentationInvite, ThesisPresentationInviteId> {
    void deleteByPresentationId(UUID id);
}
