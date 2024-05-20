# thesis-tracker
Web Application for trackage of theses applied for and supervised at the chair

## Client - React Web Application

### Local development

#### Preconditions
* Server running at http://localhost:8080
* Keycloak realm `thesis-track` is available under http://localhost:8081 (See [Keycloak Setup](#keycloak-setup))

To start the client application for local development, navigate to /client folder and execute the following command from the terminal:
```
yarn install
yarn run dev
```

Client is served at http://localhost:3000. <br>

The following **routes** are available: <br>
`/management/thesis-applications` - Role-protected console for management of thesis applications <br>
`/applications/thesis` - Form for thesis application submission

## Server - Java Spring Boot Application

### Local development

#### Preconditions
* Database available at `jdbc:postgresql://db:5432/thesis-track`
* Keycloak realm `thesis-track` is available under http://localhost:8081 (See [Keycloak Setup](#keycloak-setup))

Server is served at http://localhost:8080.

## Keycloak Setup

For local development start a keycloak container by following the steps below:
1. From the project root execute:
```
docker compose up keycloak -d
```
2. Open http://localhost:8081 and sign in with admin credentials
   * Username: `admin`
   * Password: `admin`
3. Import the [keycloak-realm-config-example-json](/keycloak-realm-config-example.json) or create a new real `thesis-track` manually.

## PostgreSQL Database

For local development start a database container by executing the following command from the project root:
```
docker compose up db -d
```

## Postfix

Notice: local development currently does not support mailing functionality, i.e. mail send attempts will fail. However, in spite of the errors the initial requests are executed normally and completely, thus, not limiting local development of other features.


