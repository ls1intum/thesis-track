--liquibase formatted sql

--changeset emilius:07-cleanup-1
DROP TABLE schedules;
ALTER TABLE users DROP COLUMN is_exchange_student;

--changeset emilius:07-cleanup-2
ALTER TABLE users ADD COLUMN custom_data jsonb;

--changeset emilius:07-cleanup-3
ALTER TABLE thesis_roles ADD COLUMN position INT NOT NULL DEFAULT 0;
ALTER TABLE topic_roles ADD COLUMN position INT NOT NULL DEFAULT 0;

--changeset emilius:07-cleanup-4
ALTER TABLE topics ADD COLUMN requirements TEXT NOT NULL DEFAULT '';

--changeset emilius:07-cleanup-5
ALTER TABLE applications ADD COLUMN reject_reason TEXT;

--changeset emilius:07-cleanup-6
ALTER TABLE thesis_presentations ADD COLUMN language TEXT NOT NULL DEFAULT 'ENGLISH';

--changeset emilius:07-cleanup-7
ALTER TABLE thesis_presentations ADD COLUMN state TEXT NOT NULL DEFAULT 'SCHEDULED';

--changeset emilius:07-cleanup-8
CREATE TABLE thesis_proposal_feedback
(
    proposal_feedback_id UUID PRIMARY KEY,
    proposal_id          UUID      NOT NULL,
    feedback             TEXT      NOT NULL,
    completed_at         TIMESTAMP,
    requested_at         TIMESTAMP NOT NULL,
    requested_by         UUID      NOT NULL,
    FOREIGN KEY (proposal_id) REFERENCES thesis_proposals (proposal_id),
    FOREIGN KEY (requested_by) REFERENCES users (user_id)
);

--changeset emilius:07-cleanup-9
CREATE TABLE application_reviewers
(
    application_id UUID      NOT NULL,
    user_id        UUID      NOT NULL,
    reason         TEXT      NOT NULL,
    reviewed_at    TIMESTAMP NOT NULL,
    PRIMARY KEY (application_id, user_id),
    FOREIGN KEY (application_id) REFERENCES applications (application_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

--changeset emilius:07-cleanup-10
INSERT INTO application_reviewers (
    application_id, user_id, reason, reviewed_at
)
SELECT DISTINCT ON (t1.application_id)
    t1.application_id,
    t1.reviewed_by,
    CASE WHEN t1.state = 'ACCEPTED' THEN 'INTERESTED' ELSE 'NOT_INTERESTED' END,
    t1.reviewed_at
FROM applications t1
WHERE t1.reviewed_by IS NOT NULL AND t1.reviewed_at IS NOT NULL;

ALTER TABLE applications DROP COLUMN reviewed_by;
