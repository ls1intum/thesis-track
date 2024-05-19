FROM node:20-alpine as build
ENV YARN_VERSION 4.0.1
RUN yarn policies set-version $YARN_VERSION
WORKDIR /app
RUN yarn config set httpTimeout 300000
COPY package.json ./
COPY yarn.lock ./
RUN yarn

ARG SERVER_HOST
ARG KEYCLOAK_HOST
ARG KEYCLOAK_REALM_NAME

ENV REACT_APP_SERVER_HOST $SERVER_HOST
ENV REACT_APP_KEYCLOAK_HOST $KEYCLOAK_HOST
ENV REACT_APP_KEYCLOAK_REALM_NAME $KEYCLOAK_REALM_NAME

COPY . ./
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
