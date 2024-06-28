FROM node:20-alpine as build

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

ARG SERVER_HOST
ARG KEYCLOAK_HOST
ARG KEYCLOAK_REALM_NAME

ENV REACT_APP_SERVER_HOST $SERVER_HOST
ENV REACT_APP_KEYCLOAK_HOST $KEYCLOAK_HOST
ENV REACT_APP_KEYCLOAK_REALM_NAME $KEYCLOAK_REALM_NAME

COPY . ./
RUN npm install
RUN npm build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
