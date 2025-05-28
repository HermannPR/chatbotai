# Script para instalar dependencias del frontend y backend
Write-Host "🚀 Instalando dependencias del proyecto Chatbot..." -ForegroundColor Green

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias del frontend instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar dependencias del frontend" -ForegroundColor Red
    exit 1
}

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
cd backend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias del backend instaladas correctamente" -ForegroundColor Green
    cd ..
} else {
    Write-Host "❌ Error al instalar dependencias del backend" -ForegroundColor Red
    cd ..
    exit 1
}

Write-Host "🎉 ¡Instalación completada! Usa 'npm start' para iniciar el proyecto completo." -ForegroundColor Green
