@echo off
echo Starting Kalakriti CMS Setup...

echo Building and starting containers...
docker-compose up -d --build

echo Waiting for backend to be ready...
:wait_loop
timeout /t 5 /nobreak >nul
curl -s http://localhost:8000/backend/healthcheck >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend not ready yet, waiting...
    goto wait_loop
)

echo Backend is ready! Running migrations...
docker-compose exec backend alembic upgrade head

echo Creating admin user...
curl -X POST http://localhost:8000/v1/backend/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@admin.com\",\"password\":\"admin\",\"full_name\":\"Admin User\",\"phone_number\":\"1234567890\"}"

echo Setup complete!
echo Admin credentials: admin@admin.com / admin
echo Frontend: http://localhost:3001
echo Backend: http://localhost:8000
pause