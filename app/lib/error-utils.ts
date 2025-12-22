/**
 * @file 错误处理工具函数
 *
 * - 统一从 unknown 中提取错误消息
 * - 提供带默认值的错误字符串转换
 * - 提供 unknown → Error 的归一化
 *
 * 注意：本文件的工具函数以“保持现有行为”为优先，避免在 UI 层引入更激进的序列化逻辑。
 */

/**
 * 从任意错误对象中提取可展示的错误消息。
 *
 * 行为约束（保持与历史实现一致）：
 * - `null` / `undefined` / `""`（空字符串）返回 `null`
 * - `string` 返回自身
 * - `Error` 返回 `error.message`
 * - `{ message: string }` 返回 message
 * - 其他情况返回 `null`
 *
 * @param error - 任意类型的错误
 * @returns 可用的错误消息，无法提取时返回 null
 */
export function extractErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }
  return null;
}

/**
 * 将任意错误对象转换为字符串（带默认值）。
 *
 * 行为约束（保持与历史实现一致）：
 * - `Error` → `error.message`
 * - `string` → 原样返回（包括空字符串）
 * - 其他 → `"未知错误"`
 *
 * @param error - 任意类型的错误
 * @returns 永远返回一个字符串
 */
export function toErrorString(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "未知错误";
}

/**
 * 将 unknown 归一化为 Error。
 *
 * @param error - 任意类型的错误
 * @returns Error 实例（如果原本就是 Error 则原样返回）
 */
export function normalizeToError(error: unknown): Error {
  return error instanceof Error ? error : new Error(toErrorString(error));
}
