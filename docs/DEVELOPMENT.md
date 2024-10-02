# Development Setup

## Keycloak

For local development start a keycloak container by following the steps below:
1. From the project root execute:
```
docker compose up keycloak -d
```
2. Open http://localhost:8081 and sign in with admin credentials
    * Username: `admin`
    * Password: `admin`
3. Import the [keycloak-realm-config-example-json](/keycloak-realm-config-example.json) or create a new realm `thesis-track` manually.
4. Assign roles `admin`, `supervisor`, `advisor` to the admin user

## PostgreSQL Database

For local development start a database container by executing the following command from the project root:
```
docker compose up db -d
```

### Liquibase

Project employs liquibase technology for database migrations. Upon a database schema change, follow the steps:
1. Create a new changeset by adding a new script in the [changelog folder](/server/src/main/resources/db/changelog/changes)
2. Include the new changeset script into the [master changelog file](/server/src/main/resources/db/changelog/db.changelog-master.xml)

## Postfix

Notice: local development currently does not support mailing functionality, i.e. mail send attempts will fail. However, in spite of the errors the initial requests are executed normally and completely, thus, not limiting local development of other features.

## Server

### Preconditions
* Database available at `jdbc:postgresql://db:5432/thesis-track`
* Keycloak realm `thesis-track` is available under http://localhost:8081 (See [Keycloak Setup](#keycloak-setup))

Server is served at http://localhost:8080.

## Client

#### Preconditions
* Server running at http://localhost:8080
* Keycloak realm `thesis-track` is available under http://localhost:8081 (See [Keycloak Setup](#keycloak-setup))

To start the client application for local development, navigate to /client folder and execute the following command from the terminal:
```
yarn install
yarn run dev
```

Client is served at http://localhost:3000. 