# ─── STAGE 1: BUILD ───────────────────────────────────────────
# Mulai dari image yang sudah ada Maven + JDK 17
# Ini cuma dipakai untuk build, tidak dibawa ke production
FROM maven:3.9-eclipse-temurin-17 AS builder

# Tentukan folder kerja di dalam container
WORKDIR /app

# Copy pom.xml DULU — pisah dari source code
# Tujuannya: kalau source code berubah tapi pom.xml tidak,
# Docker skip download dependency (pakai cache) → build lebih cepat
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Baru copy source code dan build
COPY src ./src
RUN mvn package -DskipTests -q
# Hasilnya: /app/target/hwbusiness.jar


# ─── STAGE 2: RUN ─────────────────────────────────────────────
# Image baru yang lebih ringan — hanya JRE (Java Runtime)
# JDK tidak perlu dibawa, hanya dibutuhkan saat build
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Ambil JAR hasil build dari STAGE 1
# Container stage 1 dibuang setelah ini — tidak ikut ke production
COPY --from=builder /app/target/hwbusiness.jar app.jar

# Beritahu Docker bahwa app ini pakai port 8080
# (Ini dokumentasi saja, tidak otomatis membuka port)
EXPOSE 8080

# Perintah yang jalan saat container start
CMD ["java", "-jar", "app.jar"]
