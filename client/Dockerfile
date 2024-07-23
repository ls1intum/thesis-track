FROM node:20-alpine as build

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

ARG API_SERVER_HOST
ARG KEYCLOAK_HOST
ARG KEYCLOAK_REALM_NAME
ARG KEYCLOAK_CLIENT_ID

ENV API_SERVER_HOST $API_SERVER_HOST
ENV KEYCLOAK_HOST $KEYCLOAK_HOST
ENV KEYCLOAK_REALM_NAME $KEYCLOAK_REALM_NAME
ENV KEYCLOAK_CLIENT_ID $KEYCLOAK_CLIENT_ID

COPY . ./
RUN npm install
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# use same node version like in the build image
COPY --from=build /usr/lib /usr/lib
COPY --from=build /usr/local/share /usr/local/share
COPY --from=build /usr/local/lib /usr/local/lib
COPY --from=build /usr/local/include /usr/local/include
COPY --from=build /usr/local/bin /usr/local/bin

WORKDIR /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "node generate-runtime-config.js && nginx -g \"daemon off;\""]
