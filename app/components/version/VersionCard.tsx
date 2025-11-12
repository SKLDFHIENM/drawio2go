"use client";

import React from "react";
import { Button, Card, Separator } from "@heroui/react";
import { Clock, Key, GitBranch, RotateCcw } from "lucide-react";
import type { XMLVersion } from "@/app/lib/storage/types";

interface VersionCardProps {
  version: XMLVersion;
  isLatest?: boolean;
  onRestore?: (versionId: string) => void;
}

/**
 * 版本卡片组件
 * 显示单个历史版本的详细信息，包括版本号、时间、类型标记等
 */
export function VersionCard({ version, isLatest, onRestore }: VersionCardProps) {
  // 格式化创建时间
  const createdAt = new Date(version.created_at).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 处理回滚按钮点击
  const handleRestore = () => {
    if (onRestore) {
      try {
        onRestore(version.id);
      } catch (error) {
        console.error("回滚版本失败:", error);
      }
    }
  };

  return (
    <Card.Root className="version-card" variant="secondary">
      <Card.Content className="py-3 px-4">
        {/* 版本号和标记 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="version-number">v{version.semantic_version}</span>
            {isLatest && <span className="latest-badge">最新</span>}
            {version.is_keyframe ? (
              <span className="keyframe-badge">
                <Key className="w-3 h-3" />
                关键帧
              </span>
            ) : (
              <span className="diff-badge">
                <GitBranch className="w-3 h-3" />
                Diff +{version.diff_chain_depth}
              </span>
            )}
          </div>
        </div>

        {/* 版本名称（如果存在且不同于版本号） */}
        {version.name && version.name !== version.semantic_version && (
          <h4 className="font-medium text-sm mb-1">{version.name}</h4>
        )}

        {/* 版本描述（如果存在） */}
        {version.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {version.description}
          </p>
        )}

        <Separator className="my-2" />

        {/* 底部信息和操作 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{createdAt}</span>
          </div>

          {onRestore && (
            <Button
              size="sm"
              variant="secondary"
              onPress={handleRestore}
              className="button-small-optimized"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              回滚
            </Button>
          )}
        </div>
      </Card.Content>
    </Card.Root>
  );
}
