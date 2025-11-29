"use client";

import { Button } from "@heroui/react";
import { Settings, Bot, GitBranch } from "lucide-react";

import { useAppTranslation } from "@/app/i18n/hooks";

/**
 * 设置标签类型
 */
export type SettingsTab = "general" | "llm" | "version";

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

/**
 * 设置侧边栏导航组件
 * 左侧图标导航栏，用于在文件配置和 LLM 配置之间切换
 */
export default function SettingsNav({
  activeTab,
  onTabChange,
}: SettingsNavProps) {
  const { t } = useAppTranslation("settings");

  return (
    <div className="settings-nav">
      <Button
        variant="tertiary"
        isIconOnly
        className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
        onPress={() => onTabChange("general")}
        aria-label={t("nav.general", { defaultValue: "General" })}
      >
        <Settings size={24} />
      </Button>
      <Button
        variant="tertiary"
        isIconOnly
        className={`settings-nav-item ${activeTab === "llm" ? "active" : ""}`}
        onPress={() => onTabChange("llm")}
        aria-label={t("nav.llm", { defaultValue: "LLM" })}
      >
        <Bot size={24} />
      </Button>
      <Button
        variant="tertiary"
        isIconOnly
        className={`settings-nav-item ${activeTab === "version" ? "active" : ""}`}
        onPress={() => onTabChange("version")}
        aria-label={t("nav.version", { defaultValue: "Version" })}
      >
        <GitBranch size={24} />
      </Button>
    </div>
  );
}
