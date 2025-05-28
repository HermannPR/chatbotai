@echo off
title Chatbot - Instalador de Dependencias

echo.
echo ====================================
echo    INSTALADOR CHATBOT PROJECT
echo ====================================
echo.

echo [1/3] Instalando dependencias del frontend...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo al instalar dependencias del frontend
    pause
    exit /b 1
)

echo.
echo [2/3] Instalando dependencias del backend...
echo.
cd backend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo al instalar dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Instalacion completada!
echo.
echo ====================================
echo     INSTALACION EXITOSA
echo ====================================
echo.
echo Para iniciar el proyecto completo ejecuta:
echo npm start
echo.
echo O usa estos comandos por separado:
echo npm run frontend  (solo frontend)
echo npm run backend   (solo backend)
echo.
pause
