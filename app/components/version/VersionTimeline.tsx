"use client";

import React from "react";
import { VersionCard } from "./VersionCard";
import { WIP_VERSION } from "@/app/lib/storage/constants";
import type { XMLVersion } from "@/app/lib/storage/types";

interface VersionTimelineProps {
  projectUuid: string;
  versions: XMLVersion[];
  onVersionRestore?: (versionId: string) => void;
  onVersionCreated?: () => void;
}

/**
 * 版本时间线组件
 * 显示所有历史版本的时间线列表（不包括 WIP 版本）
 */
export function VersionTimeline({
  versions,
  onVersionRestore,
}: VersionTimelineProps) {
  // 过滤出历史版本（排除 WIP）并按时间倒序排列
  const historicalVersions = React.useMemo(() => {
    try {
      return versions
        .filter((v) => v.semantic_version !== WIP_VERSION)
        .sort((a, b) => b.created_at - a.created_at);
    } catch (error) {
      console.error("版本排序失败:", error);
      return [];
    }
  }, [versions]);

  // 如果没有历史版本，显示空状态
  if (historicalVersions.length === 0) {
    return (
      <div className="version-timeline-empty">
        <div className="empty-state-small">
          <p className="text-gray-500 text-sm">暂无历史版本</p>
          <p className="text-gray-400 text-xs mt-1">
            点击&ldquo;保存版本&rdquo;按钮创建第一个版本快照
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="version-timeline">
      {/* 时间线头部 */}
      <div className="timeline-header">
        <h3 className="text-sm font-semibold text-gray-700">历史版本</h3>
        <span className="text-xs text-gray-500">
          共 {historicalVersions.length} 个版本
        </span>
      </div>

      {/* 版本列表 */}
      <div className="timeline-list">
        {historicalVersions.map((version, index) => (
          <VersionCard
            key={version.id}
            version={version}
            isLatest={index === 0}
            onRestore={onVersionRestore}
          />
        ))}
      </div>
    </div>
  );
}
