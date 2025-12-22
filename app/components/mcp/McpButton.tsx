"use client";

import {
  Button,
  TooltipContent,
  TooltipRoot,
  type ButtonProps,
} from "@heroui/react";
import { MCP as McpIcon } from "@lobehub/icons";
import { useAppTranslation } from "@/app/i18n/hooks";

/**
 * MCP 按钮组件 Props
 */
export interface McpButtonProps extends Omit<
  ButtonProps,
  "children" | "variant" | "aria-label" | "aria-pressed" | "onPress"
> {
  /**
   * 是否处于激活状态（正在暴露 MCP 接口）。
   */
  isActive: boolean;

  /**
   * 点击回调（HeroUI v3：使用 onPress）。
   */
  onPress?: () => void;
}

/**
 * MCP 按钮组件
 *
 * - 未激活：`variant="secondary"`，文案 "MCP 接口"
 * - 已激活：`variant="primary"`，文案 "暴露中"
 */
export function McpButton({
  isActive,
  onPress,
  ...buttonProps
}: McpButtonProps) {
  const { t } = useAppTranslation("mcp");
  const label = isActive ? t("button.active") : t("button.inactive");
  const tooltip = t("button.tooltip");
  const { className, ...restButtonProps } = buttonProps;

  return (
    <Button
      variant={isActive ? "primary" : "secondary"}
      aria-label={label}
      aria-pressed={isActive}
      onPress={onPress}
      className={["mcp-button", className].filter(Boolean).join(" ")}
      {...restButtonProps}
    >
      <TooltipRoot delay={0}>
        <span className="inline-flex items-center gap-2">
          <McpIcon size={16} aria-hidden />
          <span className="mcp-button__label">{label}</span>
        </span>
        <TooltipContent placement="top">
          <p>{tooltip}</p>
        </TooltipContent>
      </TooltipRoot>
    </Button>
  );
}
