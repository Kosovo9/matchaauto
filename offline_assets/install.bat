@echo off
echo 🌍 Community Resilience Global - Instalador Offline
echo -----------------------------------------------
echo ⏳ Copiando aplicación...
xcopy /E /I "%~dp0app\community-resilience-hubs-offline" "%USERPROFILE%\CommunityResilience" >nul
echo 📁 Aplicación instalada en: %USERPROFILE%\CommunityResilience
echo.
echo 📺 Abriendo tutorial...
start "" "%~dp0tutorial\tutorial-es.mp4"
echo.
pause
