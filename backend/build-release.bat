@echo off
setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

echo Building React app...
cd /d "%PROJECT_ROOT%\frontend"
call npm run build
if errorlevel 1 (
    echo Failed to build React app
    pause
    exit /b 1
)

echo.
echo Cleaning old build...
cd /d "%SCRIPT_DIR%"
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

echo Creating executable...
pyinstaller --onefile --add-data "..\frontend\dist;frontend\dist" app.py

echo.
echo SUCCESS! Executable created at: %SCRIPT_DIR%dist\app.exe
pause