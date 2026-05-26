
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
COPY --from=build /target/HwBusinessV2.0-1.0-SNAPSHOT.jar app.jar


EXPOSE 7070


CMD ["java", "-jar", "app.jar"]