--liquibase formatted sql

--changeset emilius:03-thesis-migration-1
ALTER TABLE theses ADD visibility TEXT NOT NULL DEFAULT 'INTERNAL';

--changeset emilius:03-thesis-migration-2
INSERT INTO thesis_state_changes (
    thesis_id, state, changed_at
)
SELECT t1.thesis_id, 'PROPOSAL', t1.created_at FROM theses t1
WHERE NOT EXISTS(
    SELECT * FROM thesis_state_changes t2
    WHERE t1.thesis_id = t2.thesis_id AND t2.state = 'PROPOSAL'
)
