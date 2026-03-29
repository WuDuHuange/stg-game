@echo off
chcp 65001 >nul
echo ==========================================
echo   STG机娘游戏 - 构建脚本
echo ==========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: Node.js未安装，请先安装Node.js
    exit /b 1
)

echo Node.js版本:
node -v
echo npm版本:
npm -v
echo.

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        exit /b 1
    )
    echo 依赖安装完成
    echo.
)

REM 运行代码检查
echo 正在运行代码检查...
call npm run lint
if %errorlevel% neq 0 (
    echo 警告: 代码检查发现问题，但继续构建
)
echo.

REM 运行测试
echo 正在运行测试...
call npm test
if %errorlevel% neq 0 (
    echo 警告: 测试失败，但继续构建
)
echo.

REM 构建项目
echo 正在构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 构建失败
    exit /b 1
)
echo.

echo ==========================================
echo   构建成功！
echo ==========================================
echo 输出目录: dist\
echo.

pause
