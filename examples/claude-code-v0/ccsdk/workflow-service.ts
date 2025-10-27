import type { WorkflowInfo, WorkflowNode } from "../shared/types/messages";

/**
 * WorkflowService - 管理 n8n 工作流的创建、查询和状态
 * 
 * 注意：实际的工作流创建通过 n8n MCP 工具完成
 * 这个服务主要负责：
 * 1. 解析 AI 返回的工作流信息
 * 2. 格式化工作流数据供前端展示
 * 3. 维护会话中的工作流列表
 */
export class WorkflowService {
  private n8nBaseUrl: string;

  constructor() {
    this.n8nBaseUrl = process.env.N8N_API_URL || "http://localhost:5678";
  }

  /**
   * 从 AI 响应中提取工作流信息
   * AI 通过 n8n MCP 工具创建工作流后，会返回工作流 ID 等信息
   */
  parseWorkflowFromAIResponse(response: any): WorkflowInfo | null {
    try {
      // 检查响应中是否包含工作流信息
      if (response.workflowId || response.workflow_id) {
        const workflowId = response.workflowId || response.workflow_id;
        const workflowName = response.name || response.workflow_name || "Unnamed Workflow";
        const description = response.description || "";
        const active = response.active ?? true;
        const nodes: WorkflowNode[] = this.parseNodes(response.nodes || []);

        return {
          id: workflowId,
          name: workflowName,
          description,
          url: this.getWorkflowUrl(workflowId),
          active,
          nodes,
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to parse workflow from AI response:", error);
      return null;
    }
  }

  /**
   * 解析节点信息
   */
  private parseNodes(nodesData: any[]): WorkflowNode[] {
    if (!Array.isArray(nodesData)) {
      return [];
    }

    return nodesData.map((node, index) => ({
      id: node.id || `node_${index}`,
      type: node.type || "unknown",
      name: node.name || `Node ${index + 1}`,
      parameters: node.parameters || {},
      position: node.position || [0, 0],
    }));
  }

  /**
   * 获取工作流的 n8n URL
   */
  getWorkflowUrl(workflowId: string): string {
    const baseUrl = this.n8nBaseUrl.replace(/\/$/, "");
    return `${baseUrl}/workflow/${workflowId}`;
  }

  /**
   * 从消息内容中检测并提取工作流信息
   * 当 AI 使用 n8n MCP 工具时，工具结果可能包含工作流信息
   */
  extractWorkflowFromToolResult(toolResult: any): WorkflowInfo | null {
    try {
      if (!toolResult || typeof toolResult !== "object") {
        return null;
      }

      // 检查是否是 n8n 工具的结果
      const content = toolResult.content;
      if (!content) {
        return null;
      }

      // 尝试解析 JSON 内容
      let workflowData: any;
      if (typeof content === "string") {
        try {
          workflowData = JSON.parse(content);
        } catch {
          // 可能包含工作流 ID 的文本
          const idMatch = content.match(/workflow[_\s]*id[:\s]*['"]?([a-zA-Z0-9-]+)['"]?/i);
          if (idMatch) {
            return {
              id: idMatch[1],
              name: "Workflow",
              url: this.getWorkflowUrl(idMatch[1]),
              active: true,
              nodes: [],
              createdAt: new Date().toISOString(),
            };
          }
          return null;
        }
      } else {
        workflowData = content;
      }

      // 提取工作流信息
      if (workflowData.id || workflowData.workflowId) {
        const id = workflowData.id || workflowData.workflowId;
        return {
          id,
          name: workflowData.name || "Workflow",
          description: workflowData.description,
          url: this.getWorkflowUrl(id),
          active: workflowData.active ?? true,
          nodes: this.parseNodes(workflowData.nodes || []),
          createdAt: workflowData.createdAt || new Date().toISOString(),
          updatedAt: workflowData.updatedAt,
          tags: workflowData.tags,
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to extract workflow from tool result:", error);
      return null;
    }
  }

  /**
   * 格式化工作流信息供展示
   */
  formatWorkflowSummary(workflow: WorkflowInfo): string {
    const parts = [
      `📋 工作流: ${workflow.name}`,
      `🔗 URL: ${workflow.url}`,
      `📊 状态: ${workflow.active ? "✅ 运行中" : "⏸️ 已停止"}`,
      `🔧 节点数: ${workflow.nodes.length}`,
    ];

    if (workflow.description) {
      parts.push(`📝 描述: ${workflow.description}`);
    }

    if (workflow.nodes.length > 0) {
      const nodeTypes = workflow.nodes.map((n) => n.name || n.type).join(" → ");
      parts.push(`🔄 流程: ${nodeTypes}`);
    }

    return parts.join("\n");
  }

  /**
   * 检查消息内容是否包含工作流相关的操作
   */
  isWorkflowRelated(message: string): boolean {
    const keywords = [
      "workflow", "工作流", "自动化", "automation",
      "schedule", "定时", "每", "every",
      "trigger", "触发", "监听", "watch",
      "n8n", "zapier", "integration", "集成"
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  }

  /**
   * 生成工作流状态消息
   */
  createWorkflowStatusMessage(workflow: WorkflowInfo): any {
    return {
      type: "workflow_created",
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        url: workflow.url,
        active: workflow.active,
        nodes: workflow.nodes.map(node => ({
          type: node.type,
          name: node.name,
          parameters: node.parameters
        })),
        createdAt: workflow.createdAt,
      }
    };
  }
}

