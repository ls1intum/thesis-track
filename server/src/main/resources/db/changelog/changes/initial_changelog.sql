--liquibase formatted sql

--changeset airelawaleria:1

CREATE TYPE gender AS ENUM ('FEMALE', 'MALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE CAST (varchar AS gender) WITH INOUT AS IMPLICIT;

CREATE TYPE study_program AS ENUM ('COMPUTER_SCIENCE', 'INFORMATION_SYSTEMS', 'GAMES_ENGINEERING', 'MANAGEMENT_AND_TECHNOLOGY', 'OTHER');
CREATE CAST (varchar AS study_program) WITH INOUT AS IMPLICIT;

CREATE TYPE study_degree AS ENUM ('BACHELOR', 'MASTER');
CREATE CAST (varchar AS study_degree) WITH INOUT AS IMPLICIT;

CREATE TYPE research_area AS ENUM ('EDUCATION_TECHNOLOGIES', 'HUMAN_COMPUTER_INTERACTION', 'ROBOTIC', 'SOFTWARE_ENGINEERING');
CREATE CAST (varchar AS research_area) WITH INOUT AS IMPLICIT;

CREATE TYPE focus_topic AS ENUM (
    'COMPETENCIES',
    'TEAM_BASED_LEARNING',
    'AUTOMATIC_ASSESSMENT',
    'LEARNING_PLATFORMS',
    'MACHINE_LEARNING',
    'DEI',
    'LEARNING_ANALYTICS',
    'ADAPTIVE_LEARNING',
    'K12_SCHOOLS',
    'SECURITY',
    'INFRASTRUCTURE',
    'AGILE_DEVELOPMENT',
    'MOBILE_DEVELOPMENT',
    'CONTINUOUS',
    'MODELING',
    'INNOVATION',
    'PROJECT_COURSES',
    'DISTRIBUTED_SYSTEMS',
    'DEPLOYMENT',
    'DEV_OPS',
    'INTERACTION_DESIGN',
    'USER_INVOLVEMENT',
    'USER_EXPERIENCE',
    'CREATIVITY',
    'USER_MODEL',
    'INTERACTIVE_TECHNOLOGY',
    'MOCK_UPS',
    'PROTOTYPING',
    'EMBEDDED_SYSTEMS',
    'DUCKIETOWN',
    'AUTONOMOUS_DRIVING',
    'COMMUNICATION',
    'DISTRIBUTED_CONTROL',
    'LEARNING_AUTONOMY',
    'HW_SW_CO_DESIGN');
CREATE CAST (varchar AS focus_topic) WITH INOUT AS IMPLICIT;

CREATE TYPE application_status AS ENUM ('NOT_ASSESSED', 'ACCEPTED', 'REJECTED');
CREATE CAST (varchar AS application_status) WITH INOUT AS IMPLICIT;

--changeset airelawaleria:2
CREATE TABLE student (
                       id uuid PRIMARY KEY,
                       first_name VARCHAR(100),
                       last_name VARCHAR(100),
                       gender gender,
                       nationality VARCHAR(10),
                       email VARCHAR(255),
                       tum_id VARCHAR(20),
                       matriculation_number VARCHAR(30),
                       is_exchange_student BOOLEAN
);

--changeset airelawaleria:3
CREATE TABLE thesis_advisor (
                                id uuid NOT NULL,
                                first_name varchar(255),
                                last_name varchar(255),
                                tum_id varchar(50),
                                email varchar(255)
);

--changeset airelawaleria:4
CREATE TABLE thesis_application (
                                    id uuid PRIMARY KEY,
                                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                    student_id UUID NOT NULL,
                                    current_semester SMALLINT,
                                    study_degree study_degree,
                                    study_program study_program,
                                    desired_thesis_start DATE,
                                    thesis_title VARCHAR(255),
                                    interests VARCHAR(1000),
                                    projects VARCHAR(1000),
                                    special_skills VARCHAR(1000),
                                    motivation VARCHAR(500),
                                    research_areas research_area[],
                                    focus_topics focus_topic[],
                                    assessment_comment VARCHAR(2000),
                                    application_status application_status,
                                    examination_report_filename VARCHAR(255),
                                    cv_filename VARCHAR(255),
                                    bachelor_report_filename VARCHAR(255),
                                    thesis_advisor_id uuid,
                                    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES student (id)
);