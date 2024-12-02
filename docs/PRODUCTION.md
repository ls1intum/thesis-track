# Production Setup

Example production [docker-compose.prod.yml](/docker-compose.prod.yml) file. 
You can follow the steps in [deploy_docker.yml](../.github/workflows/deploy_docker.yml) to see how it is used.

## Requirements

1. Setup a production PostgreSQL database
2. Setup a production Postfix instance for sending mails. Sending mails can be disabled
3. Setup a production keycloak instance. Guide for first time setup can be found in [Development Setup](DEVELOPMENT.md)

## Running Server
Minimal docker configuration to start a server
```yaml
image: "ghcr.io/ls1intum/thesis-track/thesis-track-server:latest"
container_name: thesis-track-server
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.server.rule=Host(`${APP_HOSTNAME}`) && PathPrefix(`/api`)"
  - "traefik.http.services.server.loadbalancer.server.port=8080"
  - "traefik.http.routers.server.entrypoints=websecure"
  - "traefik.http.routers.server.tls.certresolver=letsencrypt"
  - "traefik.http.middlewares.api-ratelimit.ratelimit.average=300"
  - "traefik.http.middlewares.api-ratelimit.ratelimit.burst=100"
  - "traefik.http.routers.server.middlewares=api-ratelimit"
  - "traefik.http.routers.server.priority=10"
volumes:
  - ./thesis_uploads:/uploads
expose:
  - "8080"
environment:
  - TZ=Europe/Berlin
  - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/thesis-track
  - SPRING_DATASOURCE_USERNAME=
  - SPRING_DATASOURCE_PASSWORD=
  - MAIL_ENABLED=true
  - MAIL_WORKSPACE_URL=
  - MAIL_SENDER=
  - POSTFIX_HOST=postfix
  - POSTFIX_PORT=25
  - POSTFIX_USERNAME=
  - POSTFIX_PASSWORD=
  - CLIENT_HOST=
  - KEYCLOAK_HOST=
  - KEYCLOAK_REALM_NAME=
  - KEYCLOAK_CLIENT_ID=
```

## Running Client
Minimal docker configuration to start the client
```yaml
image: "ghcr.io/ls1intum/thesis-track/thesis-track-client:latest"
container_name: thesis-track-client
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.client.rule=Host(`${APP_HOSTNAME}`)"
  - "traefik.http.routers.client.entrypoints=websecure"
  - "traefik.http.routers.client.tls.certresolver=letsencrypt"
  - "traefik.http.middlewares.client-compress.compress=true"
  - "traefik.http.routers.client.middlewares=client-compress"
  - "traefik.http.routers.client.priority=1"
expose:
  - "80"
volumes:
  - ./templates/privacy.html:/usr/share/nginx/html/privacy.html
  - ./templates/imprint.html:/usr/share/nginx/html/imprint.html
environment:
  - SERVER_HOST=
  - KEYCLOAK_HOST=
  - KEYCLOAK_REALM_NAME=
  - KEYCLOAK_CLIENT_ID=
  - CHAIR_NAME=
  - CHAIR_URL=
```

## Reverse Proxy
```yaml
image: traefik:v3.2
command:
  - "--providers.docker=true"
  - "--providers.docker.exposedByDefault=false"
  - "--providers.docker.network=thesis-track-network"
  - "--entrypoints.web.address=:80"
  - "--entrypoints.websecure.address=:443"
  - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
  - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
  - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
  - "--certificatesresolvers.letsencrypt.acme.email=admin@tum.de"
  - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
restart: unless-stopped
ports:
  - "80:80"
  - "443:443"
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - ./letsencrypt:/letsencrypt
```

## Backup Strategy
There are 2 places that require backups:
- The PostgreSQL database. The backup strategy depends on the database setup, but the whole public schema of the connected database should be included in the backup. 
  - Example backup command: `pg_dump -U thesistrack --schema="public" thesistrack > backup_thesistrack.sql`
  - Example import command: `psql -U thesistrack -d thesistrack -f backup_thesistrack.sql`
- The files stored at `/uploads`. In the docker example, these files are mounted to `./thesis_uploads` and backup system should collect the files from the mounted folder

There is an example script [thesis-track-backup.sh](../thesis-track-backup.sh) that you can call in a cronjob to create regular backups.

## Further Configuration

All further environment variables can be found [here](CONFIGURATION.md) 

If you want to modify the emails, you can read about that [here](MAILS.md) 