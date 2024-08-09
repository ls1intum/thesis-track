--liquibase formatted sql

--changeset emilius:04-thesis-comments-1
ALTER TABLE thesis_comments ADD type TEXT NOT NULL DEFAULT 'THESIS';
