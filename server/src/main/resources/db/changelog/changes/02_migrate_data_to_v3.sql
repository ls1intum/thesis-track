--liquibase formatted sql

--changeset emilius:02-migrate-data-to-v3-1
INSERT INTO users (
    user_id, university_id, matriculation_number, email,
    first_name, last_name, gender, nationality, is_exchange_student,
    cv_filename, degree_filename, examination_filename, focus_topics,
    research_areas, study_degree, study_program, projects, special_skills,
    interests, updated_at, joined_at
)
SELECT DISTINCT ON (t1.id)
    t1.id, t1.tum_id, t1.matriculation_number, t1.email,
    t1.first_name, t1.last_name, t1.gender, t1.nationality, t1.is_exchange_student,
    t2.cv_filename, t2.bachelor_report_filename, t2.examination_report_filename, t2.focus_topics,
    t2.research_areas, t2.study_degree, t2.study_program, t2.projects, t2.special_skills,
    t2.interests, COALESCE(t2.created_at, NOW()::TIMESTAMP), COALESCE(t2.created_at, NOW()::TIMESTAMP)
FROM student t1
         LEFT JOIN thesis_application t2 ON (t1.id = t2.student_id)
ORDER BY t1.id ASC, t2.created_at DESC NULLS LAST;

--changeset emilius:02-migrate-data-to-v3-2
INSERT INTO users (
    user_id, university_id, email,
    first_name, last_name, updated_at, joined_at
)
SELECT DISTINCT ON (t1.id)
    t1.id, t1.tum_id, t1.email,
    t1.first_name, t1.last_name,
    NOW()::TIMESTAMP, NOW()::TIMESTAMP
FROM thesis_advisor t1
WHERE NOT EXISTS(
    SELECT * FROM users t2 WHERE t1.tum_id = t2.university_id OR t1.email = t2.email
);

--changeset emilius:02-migrate-data-to-v3-3
INSERT INTO applications (
    application_id, user_id, topic_id, thesis_title, motivation,
    state, reviewed_by, desired_start_date, comment,
    created_at, reviewed_at
)
SELECT
    t1.id, t1.student_id, NULL, t1.thesis_title, t1.motivation, t1.application_status,
    t3.user_id, t1.desired_thesis_start, t1.assessment_comment,
    t1.created_at, CASE WHEN t1.application_status = 'NOT_ASSESSED' THEN NULL ELSE t1.updated_at END
FROM thesis_application t1
    LEFT JOIN thesis_advisor t2 ON (t1.thesis_advisor_id = t2.id)
    LEFT JOIN users t3 ON (t2.tum_id = t3.university_id OR t2.email = t3.email);

--changeset emilius:02-migrate-data-to-v3-4
DROP TABLE thesis_application CASCADE;
DROP TABLE thesis_advisor CASCADE;
DROP TABLE student CASCADE;

DROP TYPE gender CASCADE;
DROP TYPE study_program CASCADE;
DROP TYPE study_degree CASCADE;
DROP TYPE research_area CASCADE;
DROP TYPE focus_topic CASCADE;
DROP TYPE application_status CASCADE;
