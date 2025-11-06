@echo off
setlocal enableextensions
set ACTION=%1
if "%ACTION%"=="" goto :usage
shift

rem Resolve node exe
set NODE_EXE=node
if exist "%~dp0node-v20.10.0-win-x64\node.exe" set "NODE_EXE=%~dp0node-v20.10.0-win-x64\node.exe"
if not exist "%~dp0node-v20.10.0-win-x64\node.exe" if exist "%~dp0..\node-v20.10.0-win-x64\node.exe" set "NODE_EXE=%~dp0..\node-v20.10.0-win-x64\node.exe"
if defined TRAE_NODE_EXE set "NODE_EXE=%TRAE_NODE_EXE%"

if /I "%ACTION%"=="fuse" "%NODE_EXE%" "%~dp0scripts\memory_fusion.cjs" %*
if /I "%ACTION%"=="bootstrap" "%NODE_EXE%" "%~dp0bin\trae-bootstrap.js" %*
if /I "%ACTION%"=="bootstrap:rp" "%NODE_EXE%" "%~dp0bin\trae-bootstrap.js" rp %*
if /I "%ACTION%"=="append" "%NODE_EXE%" "%~dp0scripts\append_fusion.cjs" %*
goto :eof

:usage
echo Usage: run-kit.cmd ^<action^> [options]
echo Actions: fuse, bootstrap, bootstrap:rp, append
echo Examples:
echo run-kit.cmd fuse --output-dir .\.trae\shared
echo run-kit.cmd bootstrap --agent ump45 --memory-dir C:\path\apps\ump45\trae_memory
echo run-kit.cmd bootstrap:rp --agent shop --memory-dir C:\path\apps\shop\trae_memory
echo run-kit.cmd append --memory-dir C:\path\apps\ump45\trae_memory


