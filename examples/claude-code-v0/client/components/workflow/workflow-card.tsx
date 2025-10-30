import React, { useState } from "react";
import type { WorkflowInfo } from "../../../shared/types/messages";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { WorkflowPreview } from "./workflow-preview";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";

interface WorkflowCardProps {
  workflow: WorkflowInfo;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenInN8n = () => {
    window.open(workflow.url, "_blank", "noopener,noreferrer");
  };

  const nodeNames = workflow.nodes.map((node) => node.name).join(" → ");
  const triggerNode = workflow.nodes.find((node) => 
    node.type.toLowerCase().includes("trigger") || 
    node.type.toLowerCase().includes("schedule")
  );

  return (
    <Card className="p-4 my-3 border-2 border-blue-500/30 bg-gray-800/80 hover:bg-gray-800 transition-colors backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔄</span>
            <h3 className="text-lg font-semibold text-gray-100">{workflow.name}</h3>
            <Badge variant={workflow.active ? "default" : "secondary"}>
              {workflow.active ? "运行中" : "已停止"}
            </Badge>
          </div>
          
          {workflow.description && (
            <p className="text-sm text-gray-400 mb-2">{workflow.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {triggerNode && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">⏰ 触发器:</span>
            <span className="font-medium text-gray-200">{triggerNode.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">🔧 节点数:</span>
          <span className="font-medium text-gray-200">{workflow.nodes.length}</span>
        </div>

        {workflow.nodes.length > 0 && (
          <div className="mt-2 p-2 bg-gray-900/70 rounded border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">流程:</p>
            <p className="text-sm text-gray-300 font-mono truncate" title={nodeNames}>
              {nodeNames}
            </p>
          </div>
        )}
      </div>

      {/* 工作流可视化预览区域 */}
      {workflow.nodes.length > 0 && (
        <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen} className="mb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full mb-2 flex items-center justify-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {isPreviewOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>隐藏预览</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>预览工作流</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 animate-in slide-in-from-top-2">
              <WorkflowPreview 
                workflow={workflow} 
                width={600} 
                height={Math.max(250, workflow.nodes.length * 100)} 
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleOpenInN8n}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          variant="default"
        >
          <span className="mr-1">🔗</span>
          在 n8n 中打开
        </Button>
        
        <Button
          onClick={() => {
            navigator.clipboard.writeText(workflow.url);
          }}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          variant="outline"
          title="复制链接"
        >
          📋
        </Button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        创建于: {new Date(workflow.createdAt).toLocaleString("zh-CN")}
      </div>
    </Card>
  );
}

