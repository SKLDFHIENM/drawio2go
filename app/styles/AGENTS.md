# DrawIO2Go 样式系统文档

> 本文档为 AI 代理提供项目样式系统的完整指南

---

## 📋 目录

1. [设计系统概述](#设计系统概述)
2. [设计令牌 (Design Tokens)](#设计令牌-design-tokens)
3. [样式文件组织结构](#样式文件组织结构)
4. [Material Design 实践指南](#material-design-实践指南)
5. [Tailwind CSS v4 使用规范](#tailwind-css-v4-使用规范)
6. [常见问题与最佳实践](#常见问题与最佳实践)

---

## 设计系统概述

### 🎨 设计风格

- **主色调**: `#3388BB` (蓝色)
- **设计语言**: 现代扁平化设计 + Material Design 风格
- **圆角规范**: 统一使用 4px/8px/12px 标准
- **阴影层级**: Material Design 标准 4 层阴影系统
- **间距系统**: 4px 基准的标准间距体系

### 核心原则

1. **一致性优先** - 所有组件必须使用统一的设计令牌
2. **扁平化设计** - 避免过度的渐变、阴影和装饰效果
3. **无干扰动画** - 仅保留必要的交互反馈，避免脉冲、浮动等干扰性动画
4. **可访问性** - 遵循 WCAG 2.1 AA 标准

---

## 设计令牌 (Design Tokens)

> 所有设计令牌定义在 `app/styles/base/variables.css`

### 🔵 圆角系统

```css
--radius-sm: 0.25rem;   /* 4px - 小元素（徽章、标签） */
--radius: 0.5rem;       /* 8px - 标准圆角（按钮、输入框、卡片） */
--radius-lg: 0.75rem;   /* 12px - 大元素（对话框、大卡片） */
```

**使用场景：**
- 徽章、标签 → `var(--radius-sm)`
- 按钮、输入框、小卡片 → `var(--radius)`
- 对话框、大卡片、面板 → `var(--radius-lg)`

---

### 📏 间距系统

```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
```

**使用场景：**
- 徽章内边距、图标间距 → `var(--spacing-xs)`
- 按钮内边距、小间距 → `var(--spacing-sm)`
- 卡片内边距、标准间距 → `var(--spacing-md)`
- 对话框内边距、大间距 → `var(--spacing-lg)`
- 空状态内边距、超大间距 → `var(--spacing-xl)`

---

### 🎨 色彩系统

#### 主题色（蓝色 #3388BB）

```css
--primary-color: #3388bb;        /* 主色调 */
--primary-hover: #2a6fa0;        /* 悬停状态 */
--primary-light: #e6f2f9;        /* 浅色背景 */
--primary-foreground: #ffffff;   /* 前景文字 */
```

#### 语义化颜色

```css
--success-color: #22c55e;  /* 成功/最新版本徽章 */
--error-color: #ef4444;    /* 错误/危险操作 */
--warning-color: #f59e0b;  /* 警告/关键帧徽章 */
--info-color: #8b5cf6;     /* 信息/差异徽章（紫色） */
```

#### 灰度系统

```css
--gray-primary: #6b7280;
--gray-light: #9ca3af;
--gray-border: rgba(156, 163, 175, 0.25);
--gray-bg: rgba(156, 163, 175, 0.04);
```

#### 边框和背景

```css
/* 边框 */
--border-primary: rgba(51, 136, 187, 0.25);
--border-light: rgba(51, 136, 187, 0.15);
--border-hover: rgba(51, 136, 187, 0.3);

/* 背景 */
--bg-primary: rgba(51, 136, 187, 0.04);
--bg-secondary: rgba(51, 136, 187, 0.08);
--bg-hover: rgba(51, 136, 187, 0.12);
```

---

### 🌑 Material Design 阴影层级

```css
--shadow-1: 0 1px 3px rgba(51, 136, 187, 0.12);   /* 轻微提升 */
--shadow-2: 0 2px 6px rgba(51, 136, 187, 0.16);   /* 标准提升 */
--shadow-4: 0 4px 12px rgba(51, 136, 187, 0.16);  /* 中等提升 */
--shadow-8: 0 8px 24px rgba(51, 136, 187, 0.16);  /* 高层级提升 */
```

**使用场景：**
- 卡片默认状态 → `var(--shadow-1)`
- 卡片悬停状态 → `var(--shadow-2)`
- 下拉菜单、弹出层 → `var(--shadow-4)`
- 对话框、模态框 → `var(--shadow-8)`

**兼容性映射：**
```css
--shadow-sm: var(--shadow-1);
--shadow-md: var(--shadow-2);
--shadow-lg: var(--shadow-4);
```

---

### ⏱️ 动画系统

#### 缓动函数

```css
--ease-out-cubic: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in-out-cubic: cubic-bezier(0.4, 0, 0.6, 1);
```

#### 动画时长

```css
--duration-short: 150ms;   /* 快速交互（颜色变化、边框） */
--duration-medium: 200ms;  /* 标准交互（悬停、聚焦） */
--duration-long: 300ms;    /* 复杂动画（展开、滑动） */
```

#### 过渡动画（组合）

```css
--transition-fast: var(--duration-short) var(--ease-out-cubic);
--transition-normal: var(--duration-medium) var(--ease-out-cubic);
--transition-slow: var(--duration-long) var(--ease-out-cubic);
```

---

## 样式文件组织结构

```
app/styles/
├── base/              # 基础样式
│   ├── variables.css  # 设计令牌（必须最先导入）
│   └── reset.css      # 样式重置
├── components/        # 组件样式
│   ├── buttons.css
│   ├── chat.css
│   ├── modal.css
│   ├── version-sidebar.css
│   ├── version-wip.css
│   ├── version-timeline.css
│   ├── version-dialog.css
│   └── version-animations.css
├── layout/            # 布局样式
│   ├── sidebar.css
│   └── bottom-bar.css
├── themes/            # 主题样式
│   └── dark-mode.css
└── utilities/         # 工具样式
    └── animations.css
```

### 导入顺序（globals.css）

```css
/* 1. Tailwind CSS v4 基础 */
@import "tailwindcss";

/* 2. 基础样式（变量必须最先） */
@import "./styles/base/variables.css";
@import "./styles/base/reset.css";

/* 3. 布局样式 */
@import "./styles/layout/sidebar.css";
@import "./styles/layout/bottom-bar.css";

/* 4. 组件样式 */
@import "./styles/components/buttons.css";
@import "./styles/components/chat.css";
/* ... 其他组件 */

/* 5. 主题样式 */
@import "./styles/themes/dark-mode.css";

/* 6. 工具样式 */
@import "./styles/utilities/animations.css";
```

---

## Material Design 实践指南

### ✅ 应该做的

1. **使用设计令牌**
   ```css
   /* ✅ 正确 */
   border-radius: var(--radius);
   box-shadow: var(--shadow-2);
   padding: var(--spacing-md);

   /* ❌ 错误 */
   border-radius: 8px;
   box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
   padding: 16px;
   ```

2. **简单的交互反馈**
   ```css
   /* ✅ 正确 - 只改变颜色和阴影 */
   .card:hover {
     border-color: var(--primary-color);
     box-shadow: var(--shadow-2);
   }

   /* ❌ 错误 - 避免上移动画 */
   .card:hover {
     transform: translateY(-2px);
   }
   ```

3. **扁平化背景**
   ```css
   /* ✅ 正确 */
   background: var(--bg-primary);

   /* ❌ 错误 - 避免渐变 */
   background: linear-gradient(135deg, ...);
   ```

### ❌ 不应该做的

1. **硬编码颜色值**
   ```css
   /* ❌ 错误 */
   color: #3388BB;
   background: rgba(51, 136, 187, 0.1);

   /* ✅ 正确 */
   color: var(--primary-color);
   background: var(--bg-primary);
   ```

2. **干扰性动画**
   ```css
   /* ❌ 错误 - 脉冲动画 */
   animation: pulse 2s infinite;

   /* ❌ 错误 - 浮动动画 */
   animation: float 3s ease-in-out infinite;
   ```

3. **不规则圆角**
   ```css
   /* ❌ 错误 */
   border-radius: 1rem 1rem 0.25rem 1rem;

   /* ✅ 正确 */
   border-radius: var(--radius);
   ```

---

## Tailwind CSS v4 使用规范

### 重要变化

1. **必须使用 v4** - 不兼容 v3
2. **新导入语法**：`@import "tailwindcss"`
3. **PostCSS 配置**：`@tailwindcss/postcss`

### 配置文件

**tailwind.config.js**
```javascript
export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3388BB',
      },
    },
  },
}
```

### 与 CSS 变量结合使用

```tsx
// ✅ 正确 - 组合使用
<div className="flex gap-4 p-4 rounded-lg" style={{
  boxShadow: 'var(--shadow-2)',
  borderColor: 'var(--primary-color)'
}}>
```

### HeroUI v3 集成

```tsx
// ✅ HeroUI v3 不需要 Provider
import { Button, Card } from '@heroui/react'

// ✅ 使用 onPress 而不是 onClick
<Button onPress={() => {}} variant="solid">
  保存版本
</Button>

// ✅ 复合组件模式
<Card.Root>
  <Card.Header>标题</Card.Header>
  <Card.Content>内容</Card.Content>
</Card.Root>
```

---

## 常见问题与最佳实践

### Q1: 什么时候使用 Tailwind，什么时候使用 CSS 变量？

**建议：**
- **布局和间距** → Tailwind (`flex`, `gap-4`, `p-4`)
- **颜色、阴影、圆角** → CSS 变量 (`var(--shadow-2)`)
- **自定义样式** → CSS 文件 + CSS 变量

### Q2: 如何确保深色模式兼容？

在 `variables.css` 中覆盖变量：
```css
[data-theme="dark"], .dark {
  --primary-light: #1a3d52;
  --shadow-sidebar: -2px 0 8px rgba(51, 136, 187, 0.15);
}
```

### Q3: 新增组件时应该如何命名类？

遵循 BEM 命名规范：
```css
.component-name { }             /* 块 */
.component-name__element { }    /* 元素 */
.component-name--modifier { }   /* 修饰符 */
```

### Q4: 如何处理版本管理组件的样式？

**版本管理组件样式文件：**
- `version-sidebar.css` - 侧边栏容器
- `version-wip.css` - WIP 指示器
- `version-timeline.css` - 版本卡片和徽章
- `version-dialog.css` - 创建版本对话框

**2025-11-13 视觉要点：**
- 头部信息区采用 `sidebar-header__icon + description` 组合，文本使用 `--text-secondary`，按钮使用主色 #3388BB。
- WIP 指示器使用 `wip-indicator__body/top/meta` 三段式布局，必须带 `WIP` 徽章与“实时保存”状态。
- 时间线使用 `timeline-list::before` 绘制主轴，`.version-card::before` 绘制节点，卡片外观需保持 `var(--background)` + `box-shadow: var(--shadow-1)`。
- 历史卡片使用 `version-card__header/meta/actions` 语义 class，操作按钮右上排列，底部 meta 行展示 GitBranch/Clock 信息。

**徽章标准规范：**
```css
.badge {
  display: inline-flex;
  align-items: center;
  height: 1.25rem;              /* 20px */
  padding: 0 var(--spacing-sm); /* 0 8px */
  border-radius: var(--radius-sm);
  font-size: 0.625rem;          /* 10px */
  font-weight: 500;
  text-transform: uppercase;
}
```

### Q5: 如何测试样式修改？

1. **开发模式自动热更新** - CSS 修改无需重启
2. **检查设计令牌使用** - 搜索硬编码值 (`px`, `#`, `rgba`)
3. **测试响应式** - 使用浏览器开发者工具模拟不同屏幕
4. **测试深色模式** - 切换 `[data-theme="dark"]`

---

## 更新历史

- **2025-11-13**: 版本页面现代化外观升级
  - 版本侧边栏新增信息描述、空状态卡片与悬浮 CTA。
  - WIP 指示器升级为卡片式信息区，补充实时保存与最后更新时间元数据。
  - 历史时间线采用主轴 + 节点视觉，卡片分栏展示操作与元信息。
  - 增加文本语义变量 `--text-primary/secondary/tertiary`，统一色彩引用。
- **2025-11-12**: 初始版本，完成版本管理组件 Material Design 优化
  - 统一圆角规范至 4px/8px/12px
  - 建立 Material Design 4 层阴影系统
  - 添加标准间距系统（4px 基准）
  - 移除干扰性动画（脉冲、浮动、上移）
  - 统一徽章样式规范

---

**维护提示：** 本文档应随设计系统变更而更新。修改 `variables.css` 后，请同步更新本文档。
