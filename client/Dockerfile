FROM node:20-alpine as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

ENV CI 1

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

CMD ["/bin/sh", "-c", "node generate-runtime-env.js && nginx -g \"daemon off;\""]
