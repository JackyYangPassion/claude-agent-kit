import React from "react";
import type { WorkflowInfo } from "../../../shared/types/messages";
import { WorkflowCard } from "./workflow-card";

interface WorkflowListProps {
  workflows: WorkflowInfo[];
}

export function WorkflowList({ workflows }: WorkflowListProps) {
  if (!workflows || workflows.length === 0) {
    return null;
  }

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <span className="text-xl">⚡</span>
        <h3 className="text-sm font-semibold text-gray-300">
          自动化工作流 ({workflows.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>
    </div>
  );
}

