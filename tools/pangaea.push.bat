@echo off

REM Calls external batch file to combine and minify pangaea .js files
call pangaea.bundle.bat

REM Then deletes pangaea files and folders from apache folder
echo Deleting pangaea folders from apache...
cd %USERPROFILE%\apache\pangaea
del *.* /q /f
rd test /s /q
rd src /s /q

REM Then copies files afresh from git project location to apache folder
echo Copying pangaea folders from git to apache...
robocopy %USERPROFILE%\documents\projects\git\pangaea %USERPROFILE%\apache\pangaea /S /E /XD .git
echo Done
pause