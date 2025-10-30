"use client";

import { useMemo } from "react";
import {
  Loader2Icon,
  RefreshCcwIcon,
  StopCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkflowList } from "@/components/workflow/workflow-list";
import type { WorkflowInfo } from "../../../shared/types/messages";

type PreviewPanelProps = {
  files: Record<string, string>;
  isLoading: boolean;
  lastPrompt?: string | null;
  onRefresh?: () => void;
  onStop?: () => void;
  disabledRefresh?: boolean;
  workflows: WorkflowInfo[];
};

export function PreviewPanel({
  files,
  isLoading,
  lastPrompt,
  onRefresh,
  onStop,
  disabledRefresh,
  workflows,
}: PreviewPanelProps) {
  const refreshDisabled = Boolean(disabledRefresh) || isLoading || !onRefresh;
  const hasStopAction = typeof onStop === "function";
  const stopDisabled = !isLoading || !hasStopAction;
  const workflowCount = workflows.length;
  const previewLabel = lastPrompt
    ? `最后提示: ${lastPrompt}`
    : workflowCount > 0
      ? `已生成 ${workflowCount} 个工作流`
      : isLoading
        ? "正在生成工作流"
        : "等待生成工作流";
  const refreshTooltip = refreshDisabled
    ? isLoading
      ? "正在同步"
      : "工作区同步不可用"
    : "同步工作区文件";
  const displayLabel =
    previewLabel.length > 96 ? `${previewLabel.slice(0, 93)}...` : previewLabel;

  return (
    <div className="relative flex h-full flex-1 flex-col border-l border-border bg-gray-900 text-sm text-gray-300">
      <div className="flex items-center gap-3 border-b border-gray-700 px-6 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={onRefresh}
              disabled={refreshDisabled}
            >
              <RefreshCcwIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent align="start">{refreshTooltip}</TooltipContent>
        </Tooltip>
        {hasStopAction && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={onStop}
                disabled={stopDisabled}
              >
                <StopCircleIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start">停止生成</TooltipContent>
          </Tooltip>
        )}
        <div className="relative flex-1">
          <div className="flex items-center w-full rounded-full border border-gray-600 bg-gray-800/60 px-5 py-2.5 text-sm text-gray-300">
            <span className="flex-1 truncate" title={previewLabel}>
              {displayLabel}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {isLoading ? "生成中" : lastPrompt ? "已更新" : "空闲"}
            </span>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col overflow-y-auto px-4 py-4">
        {workflows.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-4xl">🔄</div>
              <p className="text-sm text-gray-500">
                {isLoading ? "正在生成工作流..." : "暂无工作流"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <WorkflowList workflows={workflows} />
          </div>
        )}
        {isLoading && workflows.length === 0 && (
          <div className="absolute inset-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-600 bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              正在生成工作流
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
