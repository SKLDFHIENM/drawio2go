# public/locales/zh-CN - 翻译资源（zh-CN）

本目录存放中文（简体）翻译 JSON，作为前端国际化的静态资源被按需加载。

## 文件说明

- `chat.json`：聊天侧边栏与消息相关文案
- `settings.json`：设置面板文案
- 其余文件：按功能域拆分（project/page/version/topbar/sidebar 等）

## 代码腐化清理记录

### 2025-12-22 清理

**执行的操作**：

- 补全 `chat.json` 的 zh-CN 翻译键（chatLockedTitle、chatLockedHint、projectRequired）

**影响文件**：1 个文件（chat.json）

**下次关注**：

- 补充翻译键的自动校验（与 en-US 对齐、缺失 key 提示）
- 统一错误类文案的来源（尽量从结构化错误 → i18n 映射）
