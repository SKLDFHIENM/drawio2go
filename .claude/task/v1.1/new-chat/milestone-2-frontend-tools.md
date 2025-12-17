# Milestone 2: 前端工具定义和执行器

## 目标

将所有 DrawIO 工具定义和执行逻辑迁移到前端。

## 新建文件

- `app/lib/frontend-tools.ts`

## 工具列表

| 工具名               | 说明             | 参数                     |
| -------------------- | ---------------- | ------------------------ |
| `get_drawio_xml`     | 获取当前图表 XML | 无                       |
| `replace_drawio_xml` | 替换图表 XML     | `drawio_xml: string`     |
| `export_drawio`      | 导出图表         | `format: 'svg' \| 'png'` |

## 职责

1. **工具定义**：使用 `tool()` 函数定义工具 schema，供 AI 模型识别
2. **工具执行器**：根据工具名称和参数，调用对应的 DrawIO iframe 操作

## 依赖

- 复用现有的 iframe 操作逻辑（来自 `useDrawioSocket.ts`）
- 使用 `ai` 包的 `tool` 函数
- 使用 `zod` 定义参数 schema

## 验收标准

- [ ] 工具定义符合 AI SDK 规范
- [ ] 执行器能正确调用 DrawIO iframe 方法
- [ ] 支持自动版本快照（在 `replace_drawio_xml` 后）
