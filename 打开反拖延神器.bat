@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在启动「反拖延神器」...

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo 未找到 npm。请先安装 Node.js，然后再双击本文件。
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 首次运行需要安装依赖，请稍等...
  call npm.cmd install
  if errorlevel 1 (
    echo 依赖安装失败。
    pause
    exit /b 1
  )
)

start "反拖延神器 Dev Server" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev -- --host localhost --port 5173"

echo 正在打开浏览器...
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173/"

exit /b 0
