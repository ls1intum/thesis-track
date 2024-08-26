--liquibase formatted sql

--changeset emilius:06-topics-1
DROP TABLE topic_reviewers;
CREATE TABLE topic_roles
(
    topic_id    UUID      NOT NULL,
    user_id     UUID      NOT NULL,
    role        TEXT      NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    assigned_by UUID      NOT NULL,
    PRIMARY KEY (topic_id, user_id, role),
    FOREIGN KEY (topic_id) REFERENCES topics (topic_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (assigned_by) REFERENCES users (user_id)
);

--changeset emilius:06-topics-2
ALTER TABLE topics ALTER COLUMN required_degree DROP NOT NULL;

--changeset emilius:06-topics-3
ALTER TABLE topics ADD COLUMN type TEXT;

--changeset emilius:06-topics-4
ALTER TABLE topics DROP COLUMN required_degree;
ALTER TABLE users DROP COLUMN research_areas;
ALTER TABLE users DROP COLUMN focus_topics;

--changeset emilius:06-topics-5
UPDATE applications SET comment = '' WHERE comment IS NULL;
ALTER TABLE applications
    ALTER COLUMN comment SET DEFAULT '',
    ALTER COLUMN comment SET NOT NULL;
