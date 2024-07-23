FROM node:20-alpine as build

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

ARG API_SERVER_HOST
ARG KEYCLOAK_HOST
ARG KEYCLOAK_REALM_NAME

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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
