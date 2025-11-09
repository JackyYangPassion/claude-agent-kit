# 工作流预览修复总结

## 问题诊断

### 原问题
- ✅ 工作流 ID 成功提取
- ✅ 数据传输到前端
- ❌ **节点数为 0** (`nodes: []`)
- ❌ **预览页面为黑色**（因为没有节点数据）

### 根本原因
`extractWorkflowFromText` 只从 AI 响应中提取了工作流 ID 和 URL，但没有获取节点信息。

## 解决方案

### 实现逻辑
1. 从 AI 响应文本中提取工作流 ID
2. **调用 n8n REST API** 获取完整的工作流信息（包括所有节点）
3. 将完整数据添加到 session state
4. 广播更新到前端

### 代码改动

#### 1. WorkflowService 增强 (`ccsdk/workflow-service.ts`)

**新增方法：**
```typescript
async fetchWorkflowDetails(workflowId: string): Promise<WorkflowInfo | null>
```
- 调用 n8n API: `GET /api/v1/workflows/{id}`
- 使用 `X-N8N-API-KEY` 认证
- 解析完整的工作流数据（包括所有节点）

**修改方法：**
```typescript
extractWorkflowIdFromText(text: string): string | null
```
- 只返回工作流 ID（而不是不完整的 WorkflowInfo）
- 后续由 `fetchWorkflowDetails` 获取完整信息

#### 2. Session 改进 (`ccsdk/session.ts`)

**新增方法：**
```typescript
private async fetchAndAddWorkflow(workflowId: string)
```
- 异步获取完整工作流信息
- 调用 WorkflowService.fetchWorkflowDetails
- 将完整数据添加到 state

**修改逻辑：**
- 提取到工作流 ID 后，立即调用 `fetchAndAddWorkflow`
- 等待 API 响应后再广播更新

## API 调用流程

```
1. AI 响应包含工作流 URL
   ↓
2. extractWorkflowIdFromText 提取 ID
   ↓
3. fetchAndAddWorkflow(workflowId) 
   ↓
4. fetch(`http://localhost:5678/api/v1/workflows/{id}`)
   ↓
5. 解析响应（包含完整节点信息）
   ↓
6. addWorkflowToState(完整的 WorkflowInfo)
   ↓
7. 广播到前端
   ↓
8. WorkflowCard 显示完整信息
   ↓
9. WorkflowPreview 可视化节点
```

## 预期日志输出

### 后端控制台
```
[Session xxx] ✅ Workflow ID extracted from text: y4FBm1Rx0DgEg4Zw
[Session xxx] Fetching workflow details for: y4FBm1Rx0DgEg4Zw
[WorkflowService] Fetching workflow details from: http://localhost:5678/api/v1/workflows/y4FBm1Rx0DgEg4Zw
[WorkflowService] Fetched workflow data: { id: "...", name: "...", nodes: [...], ... }
[Session xxx] ✅ Fetched workflow with 4 nodes
[Session xxx] Added new workflow, total: 1
```

### 前端控制台
```
[App] Received session state, workflows: 1
[App] Workflows data: [{
  id: "y4FBm1Rx0DgEg4Zw",
  name: "BTC Price Monitor",
  nodes: [
    { type: "n8n-nodes-base.scheduleTrigger", name: "Every 1 Minute", ... },
    { type: "n8n-nodes-base.httpRequest", name: "Get BTC Price", ... },
    { type: "n8n-nodes-base.code", name: "Extract Price", ... },
    { type: "n8n-nodes-base.telegram", name: "Send to Telegram", ... }
  ],
  url: "http://localhost:5678/workflow/y4FBm1Rx0DgEg4Zw",
  active: true
}]
```

## 测试步骤

### 1. 重启服务器
```bash
cd /Users/yangjiaqi/Documents/ForAIGC/AgentForLLM/Claudecode/claude-agent-kit/examples/claude-code-v0
bun run dev
```

### 2. 清除浏览器缓存
- Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)

### 3. 创建新工作流
```
每分钟获取 BTC 价格并发送到 Telegram
```

### 4. 验证结果
- ✅ 工作流卡片显示
- ✅ 节点数显示正确（例如：4 个节点）
- ✅ 点击"预览工作流"按钮
- ✅ SVG 可视化显示所有节点
- ✅ 节点按层级排列
- ✅ 不同类型节点颜色不同

## 环境要求

### 必需环境变量
```bash
# n8n API 配置
N8N_API_URL=http://localhost:5678/
N8N_API_KEY=your_api_key_here
```

### 验证 n8n API 可访问
```bash
curl -H "X-N8N-API-KEY: your_api_key" \
  http://localhost:5678/api/v1/workflows/y4FBm1Rx0DgEg4Zw
```

应该返回完整的工作流 JSON。

## 故障排查

### 问题：API 调用失败
**症状：**
```
[WorkflowService] Failed to fetch workflow: 401 Unauthorized
```

**解决：**
- 检查 `N8N_API_KEY` 是否正确设置
- 在 n8n 设置中生成新的 API Key

### 问题：节点仍为空
**症状：**
```
[Session xxx] ✅ Fetched workflow with 0 nodes
```

**解决：**
- 检查 n8n API 返回的数据格式
- 查看 `[WorkflowService] Fetched workflow data:` 日志
- 可能需要调整 `parseNodes` 方法

### 问题：CORS 错误
**症状：**
```
Access to fetch at 'http://localhost:5678/...' has been blocked by CORS
```

**解决：**
- 这是后端调用，不应该有 CORS 问题
- 如果出现，检查是否误用了前端 fetch

## 预期效果展示

创建工作流后，应该看到：

### 工作流卡片
```
🔄 BTC Price Monitor    [运行中]

⏰ 触发器: Every 1 Minute
🔧 节点数: 4

流程: Every 1 Minute → Get BTC Price → Extract Price → Send to Telegram

[👁️ 预览工作流 ▼]  （可点击展开）

[🔗 在 n8n 中打开]  [📋]

创建于: 2025/10/30 14:42:36
```

### 展开预览后
```
┌─────────────────────────────────────────┐
│  [工作流可视化图]                          │
│                                         │
│     ⏰ Every 1 Minute (黄色)            │
│            ↓                            │
│     🌐 Get BTC Price (灰色)            │
│            ↓                            │
│     ⚙️ Extract Price (灰色)            │
│            ↓                            │
│     📤 Send to Telegram (蓝色)         │
│                                         │
│  [⏰ 触发器] [⚙️ 处理] [📤 动作]          │
└─────────────────────────────────────────┘
```

## 文件清单

### 修改的文件
1. `ccsdk/workflow-service.ts` - 新增 API 调用方法
2. `ccsdk/session.ts` - 改进工作流提取逻辑

### 相关文件
1. `client/components/workflow/workflow-preview.tsx` - 可视化组件
2. `client/components/workflow/workflow-card.tsx` - 卡片组件
3. `client/components/workflow/workflow-list.tsx` - 列表组件
4. `shared/types/messages.ts` - 类型定义

## 性能考虑

- API 调用是异步的，不会阻塞主线程
- 每个工作流只调用一次 API
- 结果会缓存在 session state 中
- 重新加载页面时会保留工作流列表

