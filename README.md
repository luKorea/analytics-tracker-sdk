# Analytics Tracker SDK

一个功能强大的前端数据埋点 SDK，支持自动埋点、手动埋点、性能监控、错误监控等特性。

## 功能特性

- 🚀 **自动埋点**
  - 页面访问（PV）自动采集
  - 用户点击行为自动采集
  - 支持采样率配置

- 📊 **性能监控**
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - 页面加载时间
  - DOM 解析时间
  - 自动采集和上报性能指标
  - 支持自定义性能指标

- 🔍 **错误监控**
  - JS 运行时错误捕获
  - Promise 未处理异常监控
  - 资源加载错误监控
  - AJAX 请求异常监控
  - 错误堆栈信息采集
  - 错误上下文信息收集

- 💡 **其他特性**
  - 数据批量上报
  - 自定义事件上报
  - 用户信息管理
  - 调试模式支持
  - 离线数据存储
  - 自动重试机制

## 安装

```bash
npm install analytics-tracker-sdk
# 或
yarn add analytics-tracker-sdk
```

## 快速开始

```javascript
import { createTracker } from 'analytics-tracker-sdk';

// 创建 tracker 实例
const tracker = createTracker();

// 初始化配置
tracker.init({
  reportUrl: 'https://your-api.com/collect',
  appId: 'your-app-id',
  // 可选配置
  autoTrackPageView: true,
  autoTrackClick: true,
  autoTrackPerformance: true,
  autoTrackError: true,
  batchSize: 10,
  reportInterval: 5000,
  debug: false,
  samplingRate: 1
});

// 手动上报事件
tracker.track('custom_event', {
  action: 'click',
  target: 'submit_button'
});

// 设置用户信息
tracker.setUser({
  userId: '12345',
  userType: 'vip'
});

// 销毁实例
tracker.destroy();
```

## API 文档

### `createTracker()`

创建一个新的 tracker 实例。

### `tracker.init(config)`

初始化 tracker，配置选项：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| reportUrl | string | 是 | - | 数据上报地址 |
| appId | string | 是 | - | 应用标识 |
| autoTrackPageView | boolean | 否 | true | 是否自动采集页面访问 |
| autoTrackClick | boolean | 否 | true | 是否自动采集点击事件 |
| autoTrackPerformance | boolean | 否 | true | 是否自动采集性能数据 |
| autoTrackError | boolean | 否 | true | 是否自动采集错误信息 |
| batchSize | number | 否 | 10 | 批量上报的阈值 |
| reportInterval | number | 否 | 5000 | 上报间隔（毫秒）|
| debug | boolean | 否 | false | 是否开启调试模式 |
| samplingRate | number | 否 | 1 | 采样率 (0-1) |

### 错误监控

错误监控模块自动捕获以下类型的错误：

1. **运行时错误**
   - JS 语法错误
   - 类型错误
   - 引用错误等

2. **Promise 异常**
   - 未捕获的 Promise rejection
   - async/await 异常

3. **资源加载错误**
   - 图片加载失败
   - 脚本加载失败
   - CSS 文件加载失败

4. **AJAX 请求错误**
   - 请求超时
   - 网络错误
   - 服务器错误

错误信息包含：
- 错误类型
- 错误信息
- 错误堆栈
- 发生时间
- 错误来源

### 性能监控

性能监控模块自动收集以下指标：

1. **页面加载性能**
   - 页面完全加载时间
   - DOM 内容加载时间
   - DOM 可交互时间

2. **Web Vitals 指标**
   - LCP：最大内容渲染时间
   - FID：首次输入延迟
   - CLS：累积布局偏移

性能数据包含：
- 指标类型
- 指标值
- 采集时间戳

## 测试覆盖率

本项目采用 Jest 进行单元测试，当前测试覆盖率达到 100%：

- 语句覆盖率：100%
- 分支覆盖率：100%
- 函数覆盖率：100%
- 行覆盖率：100%

测试用例覆盖以下核心功能：

1. 错误监控
   - 运行时错误捕获
   - Promise 异常处理
   - 资源加载错误
   - 错误上报机制

2. 性能监控
   - 页面加载性能指标
   - Web Vitals 指标
   - 性能数据上报

3. 数据上报
   - 批量上报机制
   - 重试机制
   - 离线存储

4. 存储管理
   - 数据存储
   - 清理机制

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。在提交 PR 之前，请确保：

1. 所有测试用例通过
2. 测试覆盖率保持 100%
3. 代码符合项目规范
4. 更新相关文档

## 提交规范

本项目使用 [Commitizen](http://commitizen.github.io/cz-cli/) 来规范化提交信息。提交信息格式如下：

```
<type>(<scope>): <subject>
```

### 提交类型

- feat: 新功能
- fix: 修复 Bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构代码
- perf: 性能优化
- test: 测试相关
- chore: 构建过程或辅助工具的变动
- revert: 回滚提交

### 自动提交脚本

项目提供了自动提交脚本，位于 `scripts/auto-commit.sh`。使用方法：

```bash
# 执行脚本
./scripts/auto-commit.sh

# 脚本会自动执行以下操作：
# 1. 添加所有变更文件
# 2. 使用 git-cz 引导输入规范的提交信息
# 3. 推送到远程仓库
```