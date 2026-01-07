@echo off
set BACKUP_DIR=CommunityResilience_Backup
set CRP_DIR=%USERPROFILE%\CommunityResilience\crp

echo 📡 Esperando USB para respaldo automático...

:loop
for /f "tokens=*" %%d in ('wmic logicaldisk where "drivetype=2" get caption ^| find ":"') do (
  echo 💾 USB detectado: %%d
  mkdir "%%d\%BACKUP_DIR%" 2>nul
  xcopy /Y /D "%CRP_DIR%\*.crp" "%%d\%BACKUP_DIR%\" >nul 2>nul
  echo ✅ Respaldo completado en %DATE% %TIME%
)
timeout /t 10 >nul
goto loop
