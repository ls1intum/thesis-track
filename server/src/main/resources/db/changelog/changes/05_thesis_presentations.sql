--liquibase formatted sql

--changeset emilius:05-thesis-presentations-1
ALTER TABLE thesis_presentations ADD visibility TEXT NOT NULL DEFAULT 'PRIVATE';

--changeset emilius:05-thesis-presentations-2
ALTER TABLE thesis_presentations ADD calendar_event TEXT;
