package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.TopicRole;
import thesistrack.ls1.entity.key.TopicRoleId;

import java.util.List;
import java.util.UUID;


@Repository
public interface TopicRoleRepository extends JpaRepository<TopicRole, TopicRoleId> {
    List<TopicRole> deleteByTopicId(UUID topicId);
}
