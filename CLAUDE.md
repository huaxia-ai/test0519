# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

桌面番茄钟计时器 (Pomodoro Timer) — Electron 桌面应用。

## Commands

- **启动应用:** `npm start` (runs `electron .`)
- **打包 exe:** `npm run build` (runs `electron-builder --win portable`)
- **推送到 GitHub:** `git push` (远程仓库: `origin/main`)

## Tech Stack

- **Electron** — 主进程 (main.js) 创建无边框窗口
- **HTML/CSS/JS** — 渲染进程 (renderer/)
- **preload.js** — 通过 contextBridge 暴露 electronAPI 给渲染进程

## Architecture

```
main.js               # Electron 主进程：窗口创建、IPC 通知、置顶控制
preload.js            # 预加载脚本：暴露 electronAPI 接口
renderer/
  index.html          # 界面布局：圆形进度 SVG、控制按钮、统计
  style.css           # 样式（暗黑主题 #1a1a1a）
  timer.js            # 计时器逻辑：25-5-15 分钟阶段循环、进度更新
```

### Key Implementation Details

- 窗口 360x460，无边框 (frame: false)，透明背景 (transparent: true)，默认置顶
- 通过 `electronAPI` (contextBridge) 实现 IPC 通信，无 nodeIntegration
- 环形进度条使用 SVG circle + stroke-dasharray/stroke-dashoffset 实现
- 阶段循环：专注(25min) → 短休息(5min) → ... → 每4轮 → 长休息(15min)
- 时间配置在 timer.js 顶部常量中修改

### Git History

- Commit 1 (`8fcfecb`): 初始白色主题版本
- Commit 2 (`e47ee5d`): 切换为暗黑主题
