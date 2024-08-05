package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.UserGroup;
import thesistrack.ls1.entity.key.UserGroupId;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroup, UserGroupId> {
    List<UserGroup> deleteByUserId(UUID userId);
}
