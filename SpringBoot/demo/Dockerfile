
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app


COPY . .


WORKDIR /app/SpringBoot/demo


RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jdk
WORKDIR /app


COPY --from=build /app/SpringBoot/demo/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]