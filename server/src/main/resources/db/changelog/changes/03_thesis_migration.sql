--liquibase formatted sql

--changeset emilius:03-thesis-migration-1
ALTER TABLE theses ADD visibility TEXT NOT NULL DEFAULT 'INTERNAL';