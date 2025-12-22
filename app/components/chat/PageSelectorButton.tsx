"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dropdown, Label, type ButtonProps } from "@heroui/react";
import { Layers } from "lucide-react";
import { useAppTranslation } from "@/app/i18n/hooks";
import { usePageSelection } from "@/app/hooks";

const EMPTY_INDICES: number[] = [];

export interface PageSelectorButtonProps {
  /**
   * DrawIO XML（用于解析页面列表与默认选中状态）。
   *
   * 说明：
   * - 本组件会在 Dropdown 打开时“捕获”一次最新 xml（实现懒加载/刷新）。
   * - 解析失败或 xml 为空时会回退到默认单页。
   */
  xml: string | null;
  /**
   * 选中页面索引变化回调。
   *
   * - 返回值为页面索引（0-based，升序）。
   * - 当“全选”时返回空数组 `[]`（表示包含全部页面）。
   */
  onSelectionChange?: (selectedPageIndices: number[]) => void;
}

/**
 * 页面选择器按钮（Milestone M3）
 *
 * - 使用 HeroUI v3 Dropdown + Dropdown.Menu
 * - 支持多选，且不允许取消到 0 个页面
 * - 仅负责 UI 与本地状态管理（不做持久化）
 */
export default function PageSelectorButton({
  xml,
  onSelectionChange,
}: PageSelectorButtonProps) {
  const { t } = useAppTranslation("chat");
  const [isOpen, setIsOpen] = useState(false);
  const [effectiveXml, setEffectiveXml] = useState<string | null>(null);
  const suppressNextCloseRef = useRef(false);

  const {
    pages,
    selectedPageIds,
    setSelectedPageIds,
    isAllSelected,
    selectAll,
  } = usePageSelection({
    xml: effectiveXml,
  });

  const total = pages.length;
  const selectedCount = isAllSelected ? total : selectedPageIds.size;

  const buttonVariant: ButtonProps["variant"] = isAllSelected
    ? "secondary"
    : "primary";

  const buttonLabel = isAllSelected
    ? t("pageSelector.allPagesLabel", `页面: ${t("pageSelector.allPages")}`)
    : t("pageSelector.selectedPages", { selected: selectedCount, total });

  const disabledKeys = useMemo(() => {
    if (selectedPageIds.size !== 1) return [];
    return Array.from(selectedPageIds);
  }, [selectedPageIds]);

  useEffect(() => {
    if (!onSelectionChange) return;
    const indices = isAllSelected
      ? EMPTY_INDICES
      : pages
          .filter((page) => selectedPageIds.has(page.id))
          .map((page) => page.index)
          .sort((a, b) => a - b);
    onSelectionChange(indices);
  }, [isAllSelected, onSelectionChange, pages, selectedPageIds]);

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && suppressNextCloseRef.current) {
          suppressNextCloseRef.current = false;
          return;
        }

        setIsOpen(open);
        if (open) setEffectiveXml(xml);
      }}
    >
      <Button
        type="button"
        size="sm"
        variant={buttonVariant}
        className="page-selector-button"
        aria-label={t("pageSelector.ariaLabel")}
      >
        <Layers size={16} aria-hidden />
        {buttonLabel}
      </Button>
      <Dropdown.Popover placement="top start" className="min-w-[220px]">
        <div className="px-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="tertiary"
            className="w-full justify-start"
            onPress={selectAll}
            isDisabled={isAllSelected}
            aria-label={t("pageSelector.selectAll")}
          >
            {t("pageSelector.selectAll")}
          </Button>
        </div>

        <Dropdown.Menu
          aria-label={t("pageSelector.togglePage")}
          className="page-selector-menu"
          selectionMode="multiple"
          disallowEmptySelection
          selectedKeys={selectedPageIds}
          disabledKeys={disabledKeys}
          onSelectionChange={(keys) => {
            // HeroUI/React Aria MenuTrigger 会在选择项后默认关闭，这里做一次拦截以支持多选连续操作。
            suppressNextCloseRef.current = true;
            queueMicrotask(() => {
              suppressNextCloseRef.current = false;
            });

            if (keys === "all") {
              selectAll();
              return;
            }

            const next = new Set<string>();
            for (const key of keys) next.add(String(key));
            setSelectedPageIds(next);
          }}
        >
          {pages.map((page) => (
            <Dropdown.Item
              key={page.id}
              id={page.id}
              textValue={`${page.index + 1}. ${page.name}`}
            >
              <Label>{`${page.index + 1}. ${page.name}`}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
