# Stage 1: Build the Spring Boot application
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -Dmaven.test.skip=true

# Stage 2: Runtime image
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Update vulnerable OS packages
USER root
RUN apt-get update && \
    apt-get install -y --only-upgrade curl libcurl4t64 && \
    rm -f /usr/bin/pebble && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root application user
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup --home-dir /nonexistent \
    --shell /usr/sbin/nologin appuser

# Copy the built JAR from Stage 1
COPY --from=build --chown=appuser:appgroup /app/target/*.jar /app/app.jar

USER appuser:appgroup

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]