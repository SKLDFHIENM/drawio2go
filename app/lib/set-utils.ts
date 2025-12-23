import type { DrawioPageInfo } from "@/lib/storage/page-metadata";

/**
 * @file Set 工具函数
 *
 * 用于在 UI/Hook 层处理选择集合的常见逻辑，避免重复实现。
 */

/**
 * 判断两个 Set<string> 是否相等（元素集合相同）。
 *
 * @param a - Set A
 * @param b - Set B
 * @returns 是否相等
 */
export function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

/**
 * 判断 selectedPageIds 是否“全选”了 pageIds。
 *
 * @param selectedPageIds - 已选择的页面 ID 集合
 * @param pageIds - 当前可选页面 ID 集合
 * @returns 是否全选
 */
export function areAllSelected(
  selectedPageIds: Set<string>,
  pageIds: Set<string>,
): boolean {
  if (selectedPageIds.size !== pageIds.size) return false;
  for (const id of pageIds) {
    if (!selectedPageIds.has(id)) return false;
  }
  return true;
}

/**
 * 从页面列表构建页面 ID 的 Set。
 *
 * @param pages - 页面信息列表
 * @returns 页面 ID 集合
 */
export function buildIdSet(pages: DrawioPageInfo[]): Set<string> {
  const ids = new Set<string>();
  for (const page of pages) ids.add(page.id);
  return ids;
}
