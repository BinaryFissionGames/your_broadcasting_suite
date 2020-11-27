@echo off
cd ..
docker build -t binaryfissiongames/your-broadcasting-suite -f backend/Dockerfile .
IF %ERRORLEVEL% NEQ 0 goto :ERROR
docker build -t binaryfissiongames/your-broadcasting-suite-client -f frontend/Dockerfile .
IF %ERRORLEVEL% NEQ 0 goto :ERROR

goto END

:ERROR
echo Docker build was unsuccessful - see above for details

:END
cd scripts
