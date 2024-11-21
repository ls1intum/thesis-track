# Development Setup

## Application Architecture

![Architecture](files/subsystem-decomposition.svg)

## Keycloak

For local development start a keycloak container by following the steps below:
1. From the project root execute:
```
docker compose up keycloak -d
```
2. Open http://localhost:8081 and sign in with admin credentials
    * Username: `admin`
    * Password: `admin`
3. Click on the drowdown in the top left and go to [Create realm](http://localhost:8081/admin/master/console/#/master/add-realm)
4. Import the [keycloak-realm-config-example-json](/keycloak-realm-config-example.json) or create a new realm `thesis-track` manually.
5. Select the newly created realm and create your user in [Users](http://localhost:8081/admin/master/console/#/thesis-track/users) (username, email, first name, last name)
6. Go to "Credentials" for the new user and set a non temporary password
7. Go to "Role mapping" and assign the client roles `admin`, `supervisor`, `advisor` to the new user
   * Select "Filter by clients" and search for "thesis-track-app" to find the roles

## PostgreSQL Database

For local development start a database container by executing the following command from the project root:
```
docker compose up db -d
```

## Postfix

Notice: local development does not support mailing functionality. The mails are printed in the console when no postfix instance is configured.

## Server

### Preconditions
* Database available at `jdbc:postgresql://db:5144/thesis-track`
* Keycloak realm `thesis-track` is available under http://localhost:8081 (See [Keycloak Setup](#keycloak-setup))

To start the sever application for local development, navigate to /server folder and execute the following command from the terminal:
```
./gradlew bootRun
```

Server is served at http://localhost:8080.

## Client

#### Preconditions
* Server running at http://localhost:8080
* Keycloak realm `thesis-track` is available under http://localhost:8081 (See [Keycloak Setup](#keycloak-setup))

To start the client application for local development, navigate to /client folder and execute the following command from the terminal:
```
npm install
npm run dev
```

Client is served at http://localhost:3000. 