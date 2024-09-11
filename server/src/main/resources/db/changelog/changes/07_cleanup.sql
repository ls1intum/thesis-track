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
