--liquibase formatted sql

--changeset emilius:07-cleanup-1
DROP TABLE schedules;
ALTER TABLE users DROP COLUMN is_exchange_student;
