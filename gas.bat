@echo off
:: Hapus bin lama biar bersih
if exist bin rmdir /s /q bin
mkdir bin

echo Kompilasi...
:: 1. Pakai nama file JAR yang bener (2.2.224) dan lokasi di root (.)
javac -d bin -cp ".;h2-2.2.224.jar" *.java

if %errorlevel% neq 0 (
    echo [ERROR] Gagal Kompilasi!
    pause
    exit /b
)

echo Kompilasi Berhasil! Menjalankan...
:: 2. Samain lagi nama JAR-nya pas running. Jangan pake 'lib/' kalo emang di root.
java -cp "bin;.;h2-2.2.224.jar" Main
pause