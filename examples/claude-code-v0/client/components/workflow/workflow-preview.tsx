import React, { useMemo, useId } from "react";
import type { WorkflowInfo, WorkflowNode, WorkflowConnection } from "../../../shared/types/messages";

interface WorkflowPreviewProps {
  workflow: WorkflowInfo;
  width?: number;
  height?: number;
}

interface NodePosition {
  node: WorkflowNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function WorkflowPreview({ 
  workflow, 
  width = 600, 
  height = 300 
}: WorkflowPreviewProps) {
  const uniqueId = useId();
  const markerId = `arrowhead-${workflow.id || uniqueId}`;
  
  const nodePositions = useMemo(() => {
    return calculateNodePositions(workflow.nodes, workflow.connections, width, height);
  }, [workflow.nodes, workflow.connections, width, height]);

  const connections = useMemo(() => {
    return calculateConnections(nodePositions, workflow.connections || []);
  }, [nodePositions, workflow.connections]);

  const actualHeight = useMemo(() => {
    if (nodePositions.length === 0) return height;
    const maxY = Math.max(...nodePositions.map(p => p.y + p.height));
    return Math.max(height, maxY + 60);
  }, [nodePositions, height]);

  if (workflow.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <p className="text-sm">暂无节点信息</p>
      </div>
    );
  }

  return (
    <div className="workflow-preview-container bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 overflow-auto max-h-[500px]">
      <svg
        width={width}
        height={actualHeight}
        className="workflow-svg mx-auto"
        style={{ minWidth: width, minHeight: actualHeight }}
      >
        {/* 定义箭头标记 */}
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
          </marker>
          
          {/* 阴影效果 */}
          <filter id={`shadow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge> 
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        {/* 绘制连接线 */}
        {connections.map((conn, index) => (
          <g key={`conn-${index}`}>
            {/* 连接线阴影 */}
            <line
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="#d1d5db"
              strokeWidth="3"
              opacity="0.3"
            />
            {/* 主连接线 */}
            <line
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="#60a5fa"
              strokeWidth="2"
              markerEnd={`url(#${markerId})`}
              className="connection-line"
            />
          </g>
        ))}

        {/* 绘制节点 */}
        {nodePositions.map((pos, index) => {
          const isTrigger = pos.node.type.toLowerCase().includes("trigger") || 
                          pos.node.type.toLowerCase().includes("schedule");
          const isAction = pos.node.type.toLowerCase().includes("telegram") ||
                          pos.node.type.toLowerCase().includes("slack") ||
                          pos.node.type.toLowerCase().includes("email") ||
                          pos.node.type.toLowerCase().includes("discord") ||
                          pos.node.type.toLowerCase().includes("send");
          
          const nodeColor = isTrigger 
            ? { bg: "#fef3c7", border: "#f59e0b", icon: "⏰" }
            : isAction 
            ? { bg: "#dbeafe", border: "#3b82f6", icon: "📤" }
            : { bg: "#f3f4f6", border: "#6b7280", icon: "⚙️" };
          
          return (
            <g key={pos.node.id || `node-${index}`} filter={`url(#shadow-${uniqueId})`}>
              {/* 节点矩形 */}
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                rx="10"
                fill={nodeColor.bg}
                stroke={nodeColor.border}
                strokeWidth="2.5"
                className="workflow-node transition-all hover:brightness-105"
              />
              
              {/* 节点图标 */}
              <text
                x={pos.x + 15}
                y={pos.y + pos.height / 2}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize="18"
              >
                {nodeColor.icon}
              </text>
              
              {/* 节点名称 */}
              <text
                x={pos.x + pos.width / 2 + 10}
                y={pos.y + pos.height / 2 - 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="600"
                fill="#111827"
              >
                {truncateText(pos.node.name, 15)}
              </text>
              
              {/* 节点类型 */}
              <text
                x={pos.x + pos.width / 2 + 10}
                y={pos.y + pos.height / 2 + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {getNodeTypeLabel(pos.node.type)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 图例 */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-yellow-100 border-2 border-yellow-500 flex items-center justify-center text-xs">⏰</div>
          <span>触发器</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-500 flex items-center justify-center text-xs">⚙️</div>
          <span>处理</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-xs">📤</div>
          <span>动作</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 计算节点位置 - 自动布局算法
 */
function calculateNodePositions(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[] | undefined,
  width: number,
  height: number
): NodePosition[] {
  if (nodes.length === 0) {
    return [];
  }

  const nodeWidth = 160;
  const nodeHeight = 70;
  const horizontalSpacing = 200;
  const verticalSpacing = 120;
  const padding = 50;

  // 构建节点依赖图
  const nodeMap = new Map<string, WorkflowNode>();
  const incomingEdges = new Map<string, string[]>();
  const outgoingEdges = new Map<string, string[]>();

  nodes.forEach((node) => {
    const nodeId = node.id || node.name;
    nodeMap.set(nodeId, node);
    incomingEdges.set(nodeId, []);
    outgoingEdges.set(nodeId, []);
  });

  // 处理连接
  if (connections && connections.length > 0) {
    connections.forEach((conn) => {
      const source = conn.source;
      const target = conn.target;
      if (outgoingEdges.has(source) && incomingEdges.has(target)) {
        outgoingEdges.get(source)!.push(target);
        incomingEdges.get(target)!.push(source);
      }
    });
  } else {
    // 如果没有连接信息，按顺序连接
    for (let i = 0; i < nodes.length - 1; i++) {
      const source = nodes[i].id || nodes[i].name;
      const target = nodes[i + 1].id || nodes[i + 1].name;
      outgoingEdges.get(source)!.push(target);
      incomingEdges.get(target)!.push(source);
    }
  }

  // 找到起点节点（没有入边的节点）
  const startNodes = nodes.filter((node) => {
    const nodeId = node.id || node.name;
    return incomingEdges.get(nodeId)!.length === 0;
  });

  // 使用 BFS 进行层级布局
  const levels: WorkflowNode[][] = [];
  const visited = new Set<string>();

  function assignLevel(node: WorkflowNode, level: number) {
    const nodeId = node.id || node.name;
    if (visited.has(nodeId)) {
      return;
    }
    visited.add(nodeId);

    while (levels.length <= level) {
      levels.push([]);
    }
    levels[level].push(node);

    const targets = outgoingEdges.get(nodeId) || [];
    targets.forEach((targetId) => {
      const targetNode = nodeMap.get(targetId);
      if (targetNode) {
        assignLevel(targetNode, level + 1);
      }
    });
  }

  // 从起点开始分配层级
  if (startNodes.length > 0) {
    startNodes.forEach((node) => assignLevel(node, 0));
  } else {
    // 如果没有找到起点，从第一个节点开始
    if (nodes.length > 0) {
      assignLevel(nodes[0], 0);
    }
  }

  // 计算每个节点的位置
  const positions: NodePosition[] = [];
  levels.forEach((levelNodes, levelIndex) => {
    const levelY = padding + levelIndex * verticalSpacing;
    const levelWidth = levelNodes.length * horizontalSpacing - horizontalSpacing + nodeWidth;
    const startX = (width - levelWidth) / 2;

    levelNodes.forEach((node, nodeIndex) => {
      const x = startX + nodeIndex * horizontalSpacing;
      const y = levelY;
      positions.push({
        node,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  });

  return positions;
}

/**
 * 计算连接线的坐标
 */
function calculateConnections(
  nodePositions: NodePosition[],
  connections: WorkflowConnection[]
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const nodePosMap = new Map<string, NodePosition>();
  nodePositions.forEach((pos) => {
    const nodeId = pos.node.id || pos.node.name;
    nodePosMap.set(nodeId, pos);
  });

  const result: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  if (connections.length > 0) {
    connections.forEach((conn) => {
      const source = nodePosMap.get(conn.source);
      const target = nodePosMap.get(conn.target);

      if (source && target) {
        result.push({
          x1: source.x + source.width / 2,
          y1: source.y + source.height,
          x2: target.x + target.width / 2,
          y2: target.y,
        });
      }
    });
  } else {
    // 如果没有连接信息，按顺序连接
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const source = nodePositions[i];
      const target = nodePositions[i + 1];
      result.push({
        x1: source.x + source.width / 2,
        y1: source.y + source.height,
        x2: target.x + target.width / 2,
        y2: target.y,
      });
    }
  }

  return result;
}

/**
 * 获取节点类型的中文标签
 */
function getNodeTypeLabel(type: string): string {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes("schedule") || typeLower.includes("cron")) {
    return "定时触发";
  }
  if (typeLower.includes("webhook")) {
    return "Webhook";
  }
  if (typeLower.includes("http")) {
    return "HTTP请求";
  }
  if (typeLower.includes("telegram")) {
    return "Telegram";
  }
  if (typeLower.includes("slack")) {
    return "Slack";
  }
  if (typeLower.includes("email")) {
    return "邮件";
  }
  if (typeLower.includes("discord")) {
    return "Discord";
  }
  if (typeLower.includes("code") || typeLower.includes("function")) {
    return "代码处理";
  }
  if (typeLower.includes("set")) {
    return "数据设置";
  }
  if (typeLower.includes("merge")) {
    return "数据合并";
  }
  
  return type.split("/").pop() || type;
}

/**
 * 截断文本
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 1) + "…";
}

