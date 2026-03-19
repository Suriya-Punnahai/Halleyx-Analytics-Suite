# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application and skip tests for faster deployment
RUN mvn clean package -DskipTests

# Stage 2: Runtime with lightweight JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Use a non-root user for security (optional but recommended)
# RUN addgroup -S spring && adduser -S spring -G spring
# USER spring:spring
ENTRYPOINT ["java", "-jar", "app.jar"]
