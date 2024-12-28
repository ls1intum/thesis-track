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
CREATE TABLE thesis_feedback
(
    feedback_id UUID PRIMARY KEY,
    thesis_id            UUID      NOT NULL,
    type                 TEXT      NOT NULL,
    feedback             TEXT      NOT NULL,
    completed_at         TIMESTAMP,
    requested_at         TIMESTAMP NOT NULL,
    requested_by         UUID      NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
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

--changeset emilius:07-cleanup-11
ALTER TABLE users ADD COLUMN avatar TEXT;

--changeset emilius:07-cleanup-12
CREATE TABLE notification_settings
(
    user_id    UUID      NOT NULL,
    name       TEXT      NOT NULL,
    email      TEXT      NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, name),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

--changeset emilius:07-cleanup-13
CREATE TABLE thesis_presentation_invites
(
    presentation_id UUID      NOT NULL,
    email           TEXT      NOT NULL,
    invited_at      TIMESTAMP NOT NULL,
    PRIMARY KEY (presentation_id, email),
    FOREIGN KEY (presentation_id) REFERENCES thesis_presentations (presentation_id)
);

--changeset emilius:07-cleanup-14
CREATE TABLE thesis_files
(
    file_id     UUID      NOT NULL,
    thesis_id   UUID      NOT NULL,
    type        TEXT      NOT NULL,
    filename    TEXT      NOT NULL,
    upload_name TEXT      NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    uploaded_by UUID      NOT NULL,
    PRIMARY KEY (file_id),
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
    FOREIGN KEY (uploaded_by) REFERENCES users (user_id)
);

ALTER TABLE thesis_comments ADD COLUMN upload_name TEXT;

--changeset emilius:07-cleanup-15
INSERT INTO thesis_files (file_id, thesis_id, type, filename, upload_name, uploaded_at, uploaded_by)
SELECT
    gen_random_uuid(),
    t.thesis_id,
    'THESIS',
    t.final_thesis_filename,
    t.final_thesis_filename,
    CURRENT_TIMESTAMP,
    (SELECT tr.user_id
     FROM thesis_roles tr
     WHERE tr.thesis_id = t.thesis_id
       AND tr.role = 'STUDENT'
     ORDER BY tr.position
     LIMIT 1)
FROM theses t
WHERE t.final_thesis_filename IS NOT NULL;

INSERT INTO thesis_files (file_id, thesis_id, type, filename, upload_name, uploaded_at, uploaded_by)
SELECT
    gen_random_uuid(),
    t.thesis_id,
    'PRESENTATION',
    t.final_presentation_filename,
    t.final_presentation_filename,
    CURRENT_TIMESTAMP,
    (SELECT tr.user_id
     FROM thesis_roles tr
     WHERE tr.thesis_id = t.thesis_id
       AND tr.role = 'STUDENT'
     ORDER BY tr.position
     LIMIT 1)
FROM theses t
WHERE t.final_presentation_filename IS NOT NULL;

ALTER TABLE theses
    DROP COLUMN final_thesis_filename,
    DROP COLUMN final_presentation_filename;

--changeset emilius:07-cleanup-16
UPDATE thesis_comments SET upload_name = filename;

--changeset emilius:07-cleanup-17
ALTER TABLE theses ADD COLUMN language TEXT NOT NULL DEFAULT 'ENGLISH';
ALTER TABLE theses ADD COLUMN metadata JSONB NOT NULL DEFAULT '{"titles":{},"credits":{}}';
