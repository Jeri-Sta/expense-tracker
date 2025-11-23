@echo off
REM Personal Expense Tracker - Windows Development Setup Script

echo 🚀 Setting up Personal Expense Tracker development environment...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (\n    echo ❌ Docker is not running. Please start Docker and try again.\n    pause\n    exit /b 1\n)\n\necho ✅ Docker is running

REM Copy environment file
if not exist .env (\n    copy .env.example .env\n    echo ✅ Environment file created (.env)\n) else (\n    echo ℹ️  Environment file already exists\n)

echo.
echo 🐳 Starting development environment...
docker-compose up -d postgres redis

echo ⏳ Waiting for PostgreSQL to be ready...
:wait_postgres
docker-compose exec postgres pg_isready -h localhost -p 5432 >nul 2>&1
if errorlevel 1 (
    echo    Still waiting for PostgreSQL...
    timeout /t 2 >nul
    goto wait_postgres
)
echo ✅ PostgreSQL is ready

echo.
echo 📦 Installing backend dependencies...
cd api
call npm install
echo 🚀 Starting backend server...
start cmd /k \"npm run start:dev\"
cd ..

echo.
echo 📦 Installing frontend dependencies...
cd web-app
call npm install
echo 🚀 Starting frontend server...
start cmd /k \"npm run start\"
cd ..

echo.
echo 🎉 Development environment is starting up!
echo.
echo 📍 Access points:
echo    Frontend: http://localhost:4200
echo    Backend API: http://localhost:3000
echo    API Docs: http://localhost:3000/api-docs
echo    PostgreSQL: localhost:5432
echo    Redis: localhost:6379
echo.
echo ℹ️  Both backend and frontend will open in separate windows
echo    Close those windows to stop the services
echo.
pause