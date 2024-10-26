# Database Changes

ThesisTrack employs liquibase technology for database migrations. Upon a database schema change, follow the steps:
1. Create a new changeset by adding a new script in the [changelog folder](/server/src/main/resources/db/changelog/changes)
2. Include the new changeset script into the [master changelog file](/server/src/main/resources/db/changelog/db.changelog-master.xml)

## Database Schema
![Database Schema](files/database-schema.svg)