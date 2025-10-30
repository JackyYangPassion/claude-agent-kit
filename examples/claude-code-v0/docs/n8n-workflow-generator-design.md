# n8n 工作流生成器系统设计文档

## 1. 项目概述

### 1.1 目标
构建一个基于自然语言对话的 n8n 工作流自动生成系统，用户只需通过简单的自然语言描述，系统即可自动创建并部署到 n8n 平台的完整工作流。

### 1.2 示例用例
**输入**：
```
每分钟通过 https://coinmarketcap.com/currencies/bitcoin/ 获取 BTC 的价格并发送到 Telegram
```

**输出**：
- 自动创建包含以下节点的 n8n 工作流：
  1. Schedule Trigger（每分钟触发）
  2. HTTP Request（获取 BTC 价格）
  3. Data Processing（解析价格数据）
  4. Telegram（发送消息）
- 工作流自动激活并部署到 n8n
- 返回工作流 ID 和访问链接

### 1.3 技术架构
- **前端**：React + TypeScript + TailwindCSS
- **后端**：Bun Runtime + WebSocket
- **AI 层**：Claude Agent SDK + n8n MCP
- **工作流引擎**：n8n (localhost:5678)

---

## 2. 系统架构设计

### 2.1 整体架构图

```
┌─────────────────┐
│   用户界面       │
│  (React UI)     │
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  WebSocket      │
│  Handler        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Session        │
│  Manager        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AI Client      │
│  (Claude SDK)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐       ┌──────────────┐
│ n8n MCP Server  │←────→│  n8n API     │
└─────────────────┘       └──────────────┘
```

### 2.2 核心组件

#### 2.2.1 前端组件 (client/)
- **ChatInterface**: 主聊天界面
- **WorkflowDisplay**: 工作流展示组件（新增）
- **WorkflowStatusPanel**: 工作流状态面板（新增）

#### 2.2.2 后端服务 (server/ & ccsdk/)
- **WebSocketHandler**: WebSocket 连接管理
- **Session**: 会话管理
- **AIClient**: Claude SDK 封装
- **WorkflowService**: n8n 工作流服务（新增）

#### 2.2.3 MCP 集成
- **n8n-mcp**: 通过 MCP 协议与 n8n 通信
- 配置信息：
  - API URL: `http://localhost:5678/`
  - API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 3. 数据流设计

### 3.1 工作流生成流程

```
1. 用户输入自然语言
   ↓
2. 前端发送消息 (type: 'chat', content: '...')
   ↓
3. WebSocket 转发到 Session
   ↓
4. Session 调用 AIClient
   ↓
5. AIClient 构造提示词，调用 Claude SDK
   ↓
6. Claude 分析需求，决定调用 n8n MCP 工具
   ↓
7. n8n MCP 创建工作流
   ↓
8. 返回工作流 ID 和详情
   ↓
9. 通过 WebSocket 返回前端
   ↓
10. 前端展示工作流信息和访问链接
```

### 3.2 消息类型扩展

```typescript
// 新增消息类型
interface WorkflowCreatedMessage {
  type: 'workflow_created';
  sessionId: string;
  workflow: {
    id: string;
    name: string;
    url: string;
    active: boolean;
    nodes: Array<{
      type: string;
      name: string;
      parameters: any;
    }>;
  };
}

interface WorkflowErrorMessage {
  type: 'workflow_error';
  sessionId: string;
  error: string;
  details?: any;
}
```

---

## 4. AI Prompt 设计

### 4.1 系统提示词 (agent-prompt.ts)

需要更新系统提示词，让 Claude 理解如何：
1. 解析用户的自然语言工作流描述
2. 识别工作流的关键要素（触发器、动作、数据流）
3. 调用 n8n MCP 工具创建工作流
4. 返回结构化的工作流信息

### 4.2 工作流解析规则

Claude 需要识别以下要素：
- **触发器**：时间触发、Webhook、事件触发等
- **数据源**：HTTP 请求、数据库查询、API 调用等
- **数据处理**：转换、过滤、聚合等
- **输出动作**：发送消息、存储数据、调用 API 等

### 4.3 示例 Prompt 模板

```
用户描述：{user_input}

请分析这个工作流需求，并创建对应的 n8n 工作流。

分析步骤：
1. 识别触发方式（定时、事件、Webhook 等）
2. 确定数据源和获取方式
3. 识别数据处理需求
4. 确定输出目标和方式

然后调用 n8n MCP 工具创建工作流。
```

---

## 5. n8n MCP 工具集成

### 5.1 MCP 配置

已通过以下命令配置：
```bash
claude mcp add n8n-mcp \
  -e MCP_MODE=stdio \
  -e LOG_LEVEL=error \
  -e DISABLE_CONSOLE_OUTPUT=true \
  -e N8N_API_URL=http://localhost:5678/ \
  -e N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 n8n MCP 工具

n8n-mcp 提供的主要工具：
- `create_workflow`: 创建新工作流
- `update_workflow`: 更新现有工作流
- `activate_workflow`: 激活工作流
- `deactivate_workflow`: 停用工作流
- `list_workflows`: 列出所有工作流
- `get_workflow`: 获取工作流详情
- `delete_workflow`: 删除工作流

### 5.3 工作流节点类型

常用 n8n 节点：
- **触发器**：
  - Schedule Trigger (定时)
  - Webhook
  - Manual Trigger
  
- **HTTP 操作**：
  - HTTP Request
  
- **消息通知**：
  - Telegram
  - Slack
  - Email
  - Discord
  
- **数据处理**：
  - Code (JavaScript/Python)
  - Set
  - Function
  - Split In Batches

---

## 6. 数据库设计

### 6.1 Session 扩展

```typescript
interface SessionState {
  // 现有字段
  messages: Message[];
  usage: Usage;
  busy: boolean;
  
  // 新增字段
  workflows?: WorkflowInfo[];
}

interface WorkflowInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 工作流存储

可选：将创建的工作流信息存储到文件系统或数据库
- 位置：`.agent/<sessionId>/workflows.json`
- 格式：JSON
- 用途：工作流历史记录、恢复、分析

---

## 7. UI/UX 设计

### 7.1 界面布局

```
┌──────────────────────────────────────────┐
│  对话历史                                 │
│  ├─ 用户：每分钟获取 BTC 价格发送到 TG    │
│  ├─ AI：我理解了...                       │
│  └─ 工作流已创建 ✓                        │
│      ┌────────────────────────────────┐  │
│      │ 📋 BTC Price Monitor           │  │
│      │ 状态: ● 运行中                  │  │
│      │ 触发: 每 1 分钟                 │  │
│      │ 节点: 3                         │  │
│      │ [查看详情] [在 n8n 中打开]     │  │
│      └────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [输入框]                           [发送] │
└──────────────────────────────────────────┘
```

### 7.2 工作流卡片组件

显示信息：
- 工作流名称
- 运行状态（运行中/已停止）
- 触发器类型和频率
- 节点数量
- 操作按钮（查看详情、打开 n8n、停用/启用）

### 7.3 实时状态更新

- 工作流创建进度
- 节点添加过程
- 激活状态
- 错误提示

---

## 8. 错误处理

### 8.1 错误类型

1. **n8n 连接错误**
   - API 不可达
   - 认证失败
   
2. **工作流创建错误**
   - 节点配置错误
   - 参数验证失败
   
3. **MCP 通信错误**
   - 超时
   - 协议错误

### 8.2 错误处理策略

- 友好的错误提示
- 提供修复建议
- 支持重试机制
- 日志记录

---

## 9. 安全性设计

### 9.1 API 密钥管理

- 使用环境变量存储 n8n API Key
- 不在前端暴露敏感信息
- 服务端验证所有请求

### 9.2 工作流权限

- 限制可创建的节点类型
- 敏感操作需要二次确认
- 资源使用限制

---

## 10. 性能优化

### 10.1 响应时间优化

- 异步创建工作流
- 实时进度反馈
- 缓存常用配置

### 10.2 资源管理

- 限制单个会话的工作流数量
- 自动清理过期的测试工作流
- 批量操作支持

---

## 11. 测试计划

### 11.1 单元测试

- AIClient 工作流解析逻辑
- 消息序列化/反序列化
- 工作流状态管理

### 11.2 集成测试

- WebSocket 完整流程
- n8n MCP 通信
- 工作流生命周期

### 11.3 E2E 测试

- 用户完整交互流程
- 各种工作流场景
- 错误处理路径

---

## 12. 实施计划

### Phase 1: 基础设施 (2-3 小时)
- [ ] 更新 AIClient 配置，启用 n8n MCP
- [ ] 扩展消息类型定义
- [ ] 更新 agent-prompt.ts

### Phase 2: 后端实现 (3-4 小时)
- [ ] 实现 WorkflowService
- [ ] 扩展 Session 状态管理
- [ ] 添加工作流相关的 WebSocket 消息处理

### Phase 3: 前端实现 (3-4 小时)
- [ ] 创建 WorkflowDisplay 组件
- [ ] 创建 WorkflowStatusPanel 组件
- [ ] 集成到 ChatInterface
- [ ] 实现实时状态更新

### Phase 4: 测试与优化 (2-3 小时)
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 性能优化
- [ ] 错误处理完善

### Phase 5: 文档与部署 (1-2 小时)
- [ ] 用户使用文档
- [ ] API 文档
- [ ] 部署指南

---

## 13. 未来扩展

### 13.1 高级功能
- 工作流模板库
- 可视化工作流编辑器
- 工作流版本管理
- 协作与分享

### 13.2 智能优化
- 工作流性能分析
- 智能节点推荐
- 自动错误修复
- 成本优化建议

### 13.3 多平台支持
- Zapier 集成
- Make (Integromat) 集成
- 自定义工作流引擎

---

## 14. 附录

### 14.1 参考资料
- n8n API 文档: https://docs.n8n.io/api/
- n8n MCP 文档: https://github.com/n8n-io/n8n-mcp
- Claude Agent SDK: https://github.com/anthropics/claude-agent-sdk

### 14.2 示例工作流 JSON

```json
{
  "name": "BTC Price to Telegram",
  "nodes": [
    {
      "type": "n8n-nodes-base.scheduleTrigger",
      "name": "Every Minute",
      "parameters": {
        "rule": {
          "interval": [{"field": "minutes", "minutesInterval": 1}]
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Get BTC Price",
      "parameters": {
        "url": "https://coinmarketcap.com/currencies/bitcoin/",
        "method": "GET"
      }
    },
    {
      "type": "n8n-nodes-base.telegram",
      "name": "Send to Telegram",
      "parameters": {
        "chatId": "YOUR_CHAT_ID",
        "text": "BTC Price: {{$json.price}}"
      }
    }
  ],
  "connections": {
    "Every Minute": {"main": [[{"node": "Get BTC Price"}]]},
    "Get BTC Price": {"main": [[{"node": "Send to Telegram"}]]}
  },
  "active": true
}
```

---

## 15. 总结

本设计文档详细描述了 n8n 工作流自动生成系统的完整架构、实现方案和开发计划。通过集成 Claude AI 和 n8n MCP，我们能够让用户通过简单的自然语言描述，快速创建复杂的自动化工作流，大大降低了自动化的门槛。

核心优势：
1. **零代码**：用户无需学习 n8n 操作
2. **智能理解**：Claude AI 深度理解用户意图
3. **即时反馈**：实时显示创建过程和结果
4. **灵活扩展**：易于添加新的节点类型和功能

下一步将按照实施计划逐步实现各个功能模块。

