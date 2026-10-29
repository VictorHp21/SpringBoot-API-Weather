
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app


COPY . .


WORKDIR /app/NOME-DA-SUA-PASTA


RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jdk
WORKDIR /app


COPY --from=build /app/SprinBoot/demo/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]