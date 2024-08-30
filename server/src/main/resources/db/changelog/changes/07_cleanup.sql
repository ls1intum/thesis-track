--liquibase formatted sql

--changeset emilius:07-cleanup-1
DROP TABLE schedules;
ALTER TABLE users DROP COLUMN is_exchange_student;

--changeset emilius:07-cleanup-2
ALTER TABLE users ADD COLUMN custom_data jsonb;
