#!/bin/bash

# STG机娘游戏构建脚本

echo "=========================================="
echo "  STG机娘游戏 - 构建脚本"
echo "=========================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

echo "Node.js版本: $(node -v)"
echo "npm版本: $(npm -v)"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
    echo "依赖安装完成"
    echo ""
fi

# 运行代码检查
echo "正在运行代码检查..."
npm run lint
if [ $? -ne 0 ]; then
    echo "警告: 代码检查发现问题，但继续构建"
fi
echo ""

# 运行测试
echo "正在运行测试..."
npm test
if [ $? -ne 0 ]; then
    echo "警告: 测试失败，但继续构建"
fi
echo ""

# 构建项目
echo "正在构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "错误: 构建失败"
    exit 1
fi
echo ""

echo "=========================================="
echo "  构建成功！"
echo "=========================================="
echo "输出目录: dist/"
echo ""
