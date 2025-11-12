"use client";

import React from "react";
import { Card, Separator } from "@heroui/react";
import { Activity, Clock } from "lucide-react";
import { WIP_VERSION } from "@/app/lib/storage/constants";
import type { XMLVersion } from "@/app/lib/storage/types";

interface WIPIndicatorProps {
  projectUuid: string;
  versions: XMLVersion[];
}

/**
 * WIP 指示器组件
 * 显示当前活跃工作区的信息，包括版本号和最后更新时间
 */
export function WIPIndicator({ versions }: WIPIndicatorProps) {
  // 监听 WIP 更新事件，触发版本列表刷新
  React.useEffect(() => {
    const handleWIPUpdate = () => {
      // 触发版本列表更新
      window.dispatchEvent(new Event("version-updated"));
    };

    window.addEventListener("wip-updated", handleWIPUpdate);
    return () => window.removeEventListener("wip-updated", handleWIPUpdate);
  }, []);

  // 查找 WIP 版本 (0.0.0)
  const wipVersion = versions.find((v) => v.semantic_version === WIP_VERSION);

  // 如果没有 WIP 版本，不显示组件
  if (!wipVersion) {
    return null;
  }

  // 格式化最后修改时间
  const lastModified = new Date(wipVersion.created_at).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card.Root className="wip-indicator" variant="secondary">
      <Card.Content className="py-4 px-4">
        <div className="flex items-start gap-3">
          <div className="wip-icon">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base">活跃工作区 (WIP)</h3>
              <span className="wip-badge">v{WIP_VERSION}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              当前正在编辑的内容，所有修改实时保存于此
            </p>
            <Separator className="my-2" />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>最后更新：{lastModified}</span>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  );
}
