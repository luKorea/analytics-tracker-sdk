#!/bin/bash

# 获取当前时间作为默认提交信息
default_message="chore: auto commit at $(date '+%Y-%m-%d %H:%M:%S')"

# 如果提供了命令行参数，则使用该参数作为提交信息
commit_message=${1:-$default_message}

# 获取当前分支名
current_branch=$(git symbolic-ref --short HEAD)

# 检查是否存在未提交的更改
if ! git diff-index --quiet HEAD --; then
    # 添加所有变更
    git add .

    # 使用 git-cz 进行规范化提交
    if ! npx git-cz; then
        echo "❌ 提交代码失败"
        exit 1
    fi
fi

# 检查远程分支是否存在
if ! git ls-remote --heads origin "$current_branch" | grep -q "$current_branch"; then
    echo "🔄 远程分支 $current_branch 不存在，正在创建..."
    # 创建远程分支
    if ! git push -u origin "$current_branch"; then
        echo "❌ 创建远程分支失败"
        exit 1
    fi
    echo "✅ 远程分支创建成功"
else
    # 推送到远程仓库
    if ! git push origin "$current_branch"; then
        echo "❌ 推送代码失败"
        exit 1
    fi
fi

# 输出结果
echo "✨ 成功提交并推送代码到 $current_branch 分支"
echo "📝 提交信息: $commit_message"