--liquibase formatted sql

--changeset emilius:01-v3-initial-changelog-2
CREATE TABLE users
(
    user_id              UUID PRIMARY KEY,
    university_id        TEXT      NOT NULL,
    matriculation_number TEXT,
    email                TEXT,
    first_name           TEXT,
    last_name            TEXT,
    gender               TEXT,
    nationality          TEXT,
    is_exchange_student  BOOLEAN,
    cv_filename          TEXT,
    degree_filename      TEXT,
    examination_filename TEXT,
    focus_topics         TEXT[],
    research_areas       TEXT[],
    study_degree         TEXT,
    study_program        TEXT,
    projects             TEXT,
    interests            TEXT,
    special_skills       TEXT,
    enrolled_at          TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL,
    joined_at            TIMESTAMP NOT NULL
);

CREATE TABLE user_groups
(
    user_id UUID NOT NULL,
    "group" TEXT NOT NULL,
    PRIMARY KEY (user_id, "group"),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

--changeset emilius:01-v3-initial-changelog-3
CREATE TABLE schedules
(
    schedule_name TEXT PRIMARY KEY,
    last_received TIMESTAMP NOT NULL
);

--changeset emilius:01-v3-initial-changelog-4
CREATE TABLE topics
(
    topic_id          UUID PRIMARY KEY,
    title             TEXT      NOT NULL,
    problem_statement TEXT      NOT NULL,
    goals             TEXT      NOT NULL,
    "references"      TEXT      NOT NULL,
    required_degree   TEXT      NOT NULL,
    closed_at         TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL,
    created_at        TIMESTAMP NOT NULL,
    created_by        UUID      NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

CREATE TABLE topic_reviewers
(
    topic_id    UUID      NOT NULL,
    user_id     UUID      NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    assigned_by UUID      NOT NULL,
    PRIMARY KEY (topic_id, user_id),
    FOREIGN KEY (topic_id) REFERENCES topics (topic_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (assigned_by) REFERENCES users (user_id)
);

--changeset emilius:01-v3-initial-changelog-5
CREATE TABLE applications
(
    application_id     UUID PRIMARY KEY,
    user_id            UUID                   NOT NULL,
    topic_id           UUID,
    thesis_title       TEXT,
    motivation         TEXT                   NOT NULL,
    state              TEXT                   NOT NULL,
    desired_start_date TIMESTAMP              NOT NULL,
    comment            TEXT,
    created_at         TIMESTAMP              NOT NULL,
    reviewed_by        UUID,
    reviewed_at        TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics (topic_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users (user_id)
);

--changeset emilius:01-v3-initial-changelog-6
CREATE TABLE theses
(
    thesis_id                   UUID PRIMARY KEY,
    title                       TEXT              NOT NULL,
    info                        TEXT              NOT NULL,
    abstract                    TEXT              NOT NULL,
    state                       TEXT              NOT NULL,
    application_id              UUID,
    final_thesis_filename       TEXT,
    final_presentation_filename TEXT,
    final_grade                 TEXT,
    published_at                TIMESTAMP,
    start_date                  TIMESTAMP,
    end_date                    TIMESTAMP,
    created_at                  TIMESTAMP         NOT NULL,
    FOREIGN KEY (application_id) REFERENCES applications (application_id)
);

CREATE TABLE thesis_roles
(
    thesis_id   UUID      NOT NULL,
    user_id     UUID      NOT NULL,
    role        TEXT      NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    assigned_by UUID      NOT NULL,
    PRIMARY KEY (thesis_id, user_id),
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (assigned_by) REFERENCES users (user_id)
);

CREATE TABLE thesis_state_changes
(
    thesis_id  UUID      NOT NULL,
    state      TEXT      NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    PRIMARY KEY (thesis_id, state),
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id)
);

CREATE TABLE thesis_presentations
(
    presentation_id UUID PRIMARY KEY,
    thesis_id       UUID      NOT NULL,
    type            TEXT      NOT NULL,
    medium          TEXT      NOT NULL,
    location        TEXT      NOT NULL,
    date            TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL,
    created_by      UUID      NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

CREATE TABLE thesis_comments
(
    comment_id UUID PRIMARY KEY,
    thesis_id  UUID      NOT NULL,
    message    TEXT      NOT NULL,
    filename   TEXT,
    created_at TIMESTAMP NOT NULL,
    created_by UUID      NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

CREATE TABLE thesis_proposals
(
    proposal_id       UUID PRIMARY KEY,
    thesis_id         UUID      NOT NULL,
    proposal_filename TEXT      NOT NULL,
    approved_at       TIMESTAMP,
    approved_by       UUID,
    created_at        TIMESTAMP NOT NULL,
    created_by        UUID      NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
    FOREIGN KEY (approved_by) REFERENCES users (user_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

CREATE TABLE thesis_proposal_feedback
(
    proposal_feedback_id UUID PRIMARY KEY,
    proposal_id          UUID      NOT NULL,
    feedback             TEXT      NOT NULL,
    completed_at         TIMESTAMP,
    requested_at         TIMESTAMP NOT NULL,
    requested_by         UUID      NOT NULL,
    FOREIGN KEY (proposal_id) REFERENCES thesis_proposals (proposal_id),
    FOREIGN KEY (requested_by) REFERENCES users (user_id)
);

CREATE TABLE thesis_assessments
(
    assessment_id    UUID PRIMARY KEY,
    thesis_id        UUID      NOT NULL,
    summary          TEXT      NOT NULL,
    positives        TEXT      NOT NULL,
    negatives        TEXT      NOT NULL,
    grade_suggestion TEXT      NOT NULL,
    created_at       TIMESTAMP NOT NULL,
    created_by       UUID      NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES theses (thesis_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

--changeset emilius:01-v3-initial-changelog-7
CREATE UNIQUE INDEX idx_users_university_id ON users (university_id);
CREATE INDEX idx_applications_created_at ON applications (created_at);
