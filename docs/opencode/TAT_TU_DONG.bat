@echo off
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Kho Bau Auto Runner.lnk" 2>nul
if not exist "%~dp0state" mkdir "%~dp0state"
echo stop> "%~dp0state\STOP"
del "%~dp0state\ARMED" 2>nul
echo Da TAT tu dong: runner se dung sau task dang lam va khong tu bat cung Windows nua.
echo Muon bat lai: chay CHAY_TU_DONG.bat
pause
