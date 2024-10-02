package thesistrack.ls1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thesistrack.ls1.entity.ApplicationReviewer;
import thesistrack.ls1.entity.NotificationSetting;
import thesistrack.ls1.entity.key.ApplicationReviewerId;
import thesistrack.ls1.entity.key.NotificationSettingId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, NotificationSettingId> {

}
