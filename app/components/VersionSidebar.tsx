"use client";

import React from "react";
import { Button } from "@heroui/react";
import { WIPIndicator } from "./version/WIPIndicator";
import { VersionTimeline } from "./version/VersionTimeline";
import { CreateVersionDialog } from "./version/CreateVersionDialog";
import { useStorageXMLVersions } from "@/app/hooks/useStorageXMLVersions";
import { History, Save } from "lucide-react";
import type { XMLVersion } from "@/app/lib/storage/types";

interface VersionSidebarProps {
  projectUuid: string | null;
  onVersionRestore?: (versionId: string) => void;
}

/**
 * 版本侧边栏主组件
 * 集成 WIP 指示器、版本时间线和创建版本对话框
 */
export function VersionSidebar({
  projectUuid,
  onVersionRestore,
}: VersionSidebarProps) {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [versions, setVersions] = React.useState<XMLVersion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { getAllXMLVersions } = useStorageXMLVersions();

  // 加载版本列表
  const loadVersions = React.useCallback(async () => {
    if (!projectUuid) return;

    setIsLoading(true);
    setError(null);
    try {
      const allVersions = await getAllXMLVersions(projectUuid);
      setVersions(allVersions);
    } catch (err) {
      console.error("加载版本列表失败:", err);
      setError("加载版本列表失败");
    } finally {
      setIsLoading(false);
    }
  }, [projectUuid, getAllXMLVersions]);

  // 项目变化时重新加载版本列表
  React.useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // 监听版本更新事件（创建/回滚后自动刷新）
  React.useEffect(() => {
    const handleVersionUpdate = () => {
      loadVersions();
    };

    window.addEventListener("version-updated", handleVersionUpdate);
    return () => window.removeEventListener("version-updated", handleVersionUpdate);
  }, [loadVersions]);

  // 版本创建后重新加载列表
  const handleVersionCreated = React.useCallback(() => {
    setShowCreateDialog(false);
    loadVersions();
  }, [loadVersions]);

  // 如果没有选择项目，显示空状态
  if (!projectUuid) {
    return (
      <div className="version-sidebar">
        <div className="empty-state">
          <History className="w-12 h-12 text-gray-400" />
          <p className="text-gray-500 mt-4">请先选择一个项目</p>
        </div>
      </div>
    );
  }

  // 如果加载失败，显示错误状态
  if (error) {
    return (
      <div className="version-sidebar">
        <div className="sidebar-header">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-semibold">版本管理</h2>
          </div>
        </div>
        <div className="empty-state">
          <p className="text-red-500">{error}</p>
          <Button
            size="sm"
            variant="secondary"
            onPress={loadVersions}
            className="mt-4"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="version-sidebar">
      {/* 顶部标题和操作按钮 */}
      <div className="sidebar-header">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="text-lg font-semibold">版本管理</h2>
        </div>
        <Button
          size="sm"
          variant="primary"
          onPress={() => setShowCreateDialog(true)}
          className="button-primary"
          isDisabled={isLoading}
        >
          <Save className="w-4 h-4" />
          保存版本
        </Button>
      </div>

      {/* 滚动内容区域 */}
      <div className="sidebar-content">
        {/* WIP 指示器 */}
        <WIPIndicator projectUuid={projectUuid} versions={versions} />

        {/* 版本时间线 */}
        <VersionTimeline
          projectUuid={projectUuid}
          versions={versions}
          onVersionRestore={onVersionRestore}
          onVersionCreated={handleVersionCreated}
        />
      </div>

      {/* 创建版本对话框 */}
      <CreateVersionDialog
        projectUuid={projectUuid}
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onVersionCreated={handleVersionCreated}
      />
    </div>
  );
}
