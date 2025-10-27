import React from "react";
import type { WorkflowInfo } from "../../../shared/types/messages";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface WorkflowCardProps {
  workflow: WorkflowInfo;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const handleOpenInN8n = () => {
    window.open(workflow.url, "_blank", "noopener,noreferrer");
  };

  const nodeNames = workflow.nodes.map((node) => node.name).join(" → ");
  const triggerNode = workflow.nodes.find((node) => 
    node.type.toLowerCase().includes("trigger") || 
    node.type.toLowerCase().includes("schedule")
  );

  return (
    <Card className="p-4 my-3 border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔄</span>
            <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
            <Badge variant={workflow.active ? "default" : "secondary"}>
              {workflow.active ? "运行中" : "已停止"}
            </Badge>
          </div>
          
          {workflow.description && (
            <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {triggerNode && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">⏰ 触发器:</span>
            <span className="font-medium text-gray-700">{triggerNode.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">🔧 节点数:</span>
          <span className="font-medium text-gray-700">{workflow.nodes.length}</span>
        </div>

        {workflow.nodes.length > 0 && (
          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">流程:</p>
            <p className="text-sm text-gray-700 font-mono truncate" title={nodeNames}>
              {nodeNames}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleOpenInN8n}
          className="flex-1"
          variant="default"
        >
          <span className="mr-1">🔗</span>
          在 n8n 中打开
        </Button>
        
        <Button
          onClick={() => {
            navigator.clipboard.writeText(workflow.url);
          }}
          variant="outline"
          title="复制链接"
        >
          📋
        </Button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        创建于: {new Date(workflow.createdAt).toLocaleString("zh-CN")}
      </div>
    </Card>
  );
}

