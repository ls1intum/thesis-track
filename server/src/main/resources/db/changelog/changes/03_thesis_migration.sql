--liquibase formatted sql

--changeset emilius:03-thesis-migration-1
ALTER TABLE theses ADD visibility TEXT NOT NULL DEFAULT 'PRIVATE';
ALTER TABLE theses ADD final_feedback TEXT;
ALTER TABLE theses DROP COLUMN published_at;
ALTER TABLE thesis_presentations RENAME COLUMN date TO scheduled_at;
ALTER TABLE thesis_presentations ADD stream_url TEXT;
ALTER TABLE thesis_presentations DROP COLUMN medium;
ALTER TABLE thesis_presentations ALTER COLUMN location DROP NOT NULL;

--changeset emilius:03-thesis-migration-2
INSERT INTO thesis_state_changes (
    thesis_id, state, changed_at
)
SELECT t1.thesis_id, 'PROPOSAL', t1.created_at FROM theses t1
WHERE NOT EXISTS(
    SELECT * FROM thesis_state_changes t2
    WHERE t1.thesis_id = t2.thesis_id AND t2.state = 'PROPOSAL'
);

--changeset emilius:03-thesis-migration-3
DROP TABLE thesis_proposal_feedback;
