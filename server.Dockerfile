FROM gradle:8.11.1-jdk21 AS build

COPY --chown=gradle:gradle . /home/gradle/thesis-track
WORKDIR /home/gradle/thesis-track/server

RUN gradle build -x test --no-daemon

FROM eclipse-temurin:21

EXPOSE 8080

RUN mkdir /app

COPY --from=build /home/gradle/thesis-track/server/build/libs/*.jar /app/server.jar

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom","-jar","/app/server.jar"]
