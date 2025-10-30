# 工作流预览功能调试指南

## 问题描述
用户创建工作流后，在聊天界面看不到"预览工作流"按钮和工作流卡片。

## 已实现的功能

### 1. 工作流可视化预览组件 (`client/components/workflow/workflow-preview.tsx`)
- 使用 SVG 绘制工作流节点和连接线
- 自动层级布局算法
- 节点类型区分：触发器（黄色）、处理节点（灰色）、动作节点（蓝色）
- 带阴影效果和渐变背景

### 2. 工作流卡片组件 (`client/components/workflow/workflow-card.tsx`)
- 显示工作流基本信息（名称、状态、节点数）
- **"👁️ 预览工作流"** 可展开按钮
- "在 n8n 中打开"按钮
- "复制链接"按钮

### 3. 工作流列表组件 (`client/components/workflow/workflow-list.tsx`)
- 显示多个工作流卡片
- 置顶在聊天界面

## 调试步骤

### 步骤 1: 重启服务器
```bash
cd /Users/yangjiaqi/Documents/ForAIGC/AgentForLLM/Claudecode/claude-agent-kit/examples/claude-code-v0
bun run dev
```

### 步骤 2: 打开浏览器控制台
1. 打开浏览器（Chrome/Edge）
2. 按 F12 或右键 → 检查
3. 切换到 Console 标签页

### 步骤 3: 创建工作流
向 AI 发送创建工作流的请求，例如：
```
每分钟获取 BTC 价格并发送到 Telegram
```

### 步骤 4: 查看控制台日志

应该看到以下日志输出：

#### 后端日志（服务器控制台）：
```
[Session xxx] Checking N content blocks for workflow info
[Session xxx] Found tool_use: create_workflow
[Session xxx] Found tool_result, attempting to extract workflow...
[WorkflowService] Extracting workflow from tool result: ...
[Session xxx] ✅ Workflow detected: workflow_id workflow_name
[Session xxx] Workflow nodes: N
[Session xxx] Added new workflow, total: 1
[sanitizeSessionStateForTransport] Input workflows: 1
[sanitizeSessionStateForTransport] Output workflows: 1
[Session xxx] Broadcasting session update, workflows count: 1
```

#### 前端日志（浏览器控制台）：
```
[App] Received session state, workflows: 1
[App] Workflows data: [{ id: "...", name: "...", nodes: [...] }]
[ChatInterface] Checking workflows: 1
```

## 可能的问题和解决方案

### 问题 1: 工作流数据未被提取
**症状**: 看不到 "[Session xxx] ✅ Workflow detected"

**原因**: 
- n8n MCP 工具返回的数据格式不符合预期
- WorkflowService.extractWorkflowFromToolResult 无法解析

**解决**:
查看 `[WorkflowService] Extracting workflow from tool result` 的输出，检查数据格式

### 问题 2: 工作流数据未传输到前端
**症状**: 后端有 "Workflow detected"，但前端没有 "[App] Received session state"

**原因**:
- WebSocket 连接断开
- 序列化问题

**解决**:
检查 WebSocket 连接状态，查看 Network 标签中的 WS 连接

### 问题 3: 工作流卡片未渲染
**症状**: 前端收到 workflows 数据，但页面上看不到卡片

**原因**:
- ChatInterface 条件判断问题
- WorkflowList 或 WorkflowCard 组件渲染错误

**解决**:
检查 React DevTools，查看 sessionState.workflows 的值

## 预期效果

创建工作流成功后，应该看到：

1. **工作流卡片**：
   - 蓝色边框的卡片
   - 显示工作流名称和状态徽章
   - 显示触发器信息和节点数
   - 显示节点流程文本

2. **预览按钮**：
   - "👁️ 预览工作流" 按钮（带下拉箭头）
   - 点击后展开可视化预览

3. **可视化预览**（展开后）：
   - SVG 绘制的节点图
   - 不同颜色的节点（触发器、处理、动作）
   - 节点之间的连接线和箭头
   - 底部图例说明

## 手动测试方法

如果自动提取失败，可以手动测试组件：

1. 打开浏览器控制台
2. 输入以下代码：
```javascript
// 模拟工作流数据
window.testWorkflow = {
  id: "test-001",
  name: "测试工作流",
  description: "测试描述",
  url: "http://localhost:5678/workflow/test-001",
  active: true,
  nodes: [
    { id: "1", type: "n8n-nodes-base.scheduleTrigger", name: "Every 1 Minute", parameters: {} },
    { id: "2", type: "n8n-nodes-base.httpRequest", name: "Get BTC Price", parameters: {} },
    { id: "3", type: "n8n-nodes-base.telegram", name: "Send to Telegram", parameters: {} }
  ],
  createdAt: new Date().toISOString()
};
```

3. 然后在 React DevTools 中手动设置 sessionState.workflows = [window.testWorkflow]

## 需要检查的文件

1. `ccsdk/session.ts` - 工作流提取逻辑
2. `ccsdk/workflow-service.ts` - 工作流解析服务
3. `client/App.tsx` - 接收 session_update
4. `client/components/chat-interface.tsx` - 渲染工作流列表
5. `client/components/workflow/workflow-list.tsx` - 工作流列表组件
6. `client/components/workflow/workflow-card.tsx` - 工作流卡片组件
7. `client/components/workflow/workflow-preview.tsx` - 工作流可视化预览组件

## 联系信息
如果问题仍未解决，请提供：
1. 完整的浏览器控制台日志
2. 服务器控制台日志
3. 创建工作流的完整提示词
4. n8n 中工作流是否成功创建

