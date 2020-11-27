@echo off
cd ..
docker build -t your-broadcasting-suite-dev:0.0.1 -f backend/Dockerfile.dev .
IF %ERRORLEVEL% NEQ 0 goto :ERROR
docker build -t your-broadcasting-suite-client-dev:0.0.1 -f frontend/Dockerfile.dev .
IF %ERRORLEVEL% NEQ 0 goto :ERROR

goto END

:ERROR
echo Docker build was unsuccessful - see above for details

:END
cd scripts
