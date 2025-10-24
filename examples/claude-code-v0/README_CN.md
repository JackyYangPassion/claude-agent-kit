# Claude Agent SDK Web 预览

本示例项目演示了 `@anthropic-ai/claude-agent-sdk` 的最小化端到端集成，其行为类似于 v0.dev 的轻量级版本：你可以与 Claude 聊天，让它生成 React + Tailwind UI，并实时观看生成的页面更新。

## 演示


[演示视频](screenshots/claude-code-v0.mp4)
<img width="1947" height="1259" alt="image" src="https://github.com/user-attachments/assets/046db1ec-b16a-4b5c-b09c-15076e16d1d4" />


## 主要特性
- **聊天驱动的 UI 生成**：单页 React 客户端通过 WebSocket 流式传输对话事件，并在收到 Claude 的部分响应时进行渲染。
- **实时工作区预览**：每个 agent 会话在其自己的沙箱中运行，客户端将这些文件镜像到嵌入式 Sandpack playground 中以获得即时反馈。
- **Claude agent 编排**：Bun 服务器封装了 Claude Agent SDK，转发用户提示，并将工具输出流式传输回浏览器。
- **提示词和工作区控制**：默认系统提示词位于 `ccsdk/agent-prompt.ts` 中，而 `.agent` 存储从 `./agent` 模板目录克隆的会话工作区。

## 项目布局
- `client/`：React 界面，包含聊天、消息渲染和基于 Sandpack 的预览面板。
- `server/`：Bun 运行时，公开 WebSocket 端点（`/ws`）以及用于工作区同步的 REST 辅助功能。
- `ccsdk/`：Claude SDK 粘合代码，包括 `AIClient`、`Session` 生命周期管理器和 WebSocket 处理器。
- `shared/`：跨运行时的 TypeScript 类型，用于聊天消息、附件和会话状态。
- `agent/`：复制到每个新会话工作区的种子文件。
- `.agent/`：运行时自动生成；保存 agent 编辑的每个会话工作目录。

## 工作原理
1. 浏览器连接到 `ws://localhost:3000/ws`，显示现有会话状态，并发布用户提示。
2. `server/server.ts` 将 WebSocket 连接到 `ccsdk/websocket-handler.ts`，后者创建或恢复一个 `Session`。
3. 每个 `Session` 委托给 `ccsdk/ai-client.ts`，将用户提示（连同来自 `ccsdk/agent-prompt.ts` 的系统提示）转发到 `@anthropic-ai/claude-agent-sdk`。
4. 流式响应广播给所有订阅者，同时文件系统编辑被写入 `.agent/<sessionId>`。
5. 文件监视器通过 `workspace_update` 消息报告工作区更改；客户端使用它们并将文件提供给 Sandpack 以进行实时预览或检查。

## 快速开始
1. 安装 Bun（>=1.1）并确保你的 `ANTHROPIC_API_KEY` 在环境中可用（或在 `dotenv` 可以加载的 `.env` 文件中）。
2. 安装依赖项：
   ```bash
   bun install
   ```
3. 启动开发服务器：
   ```bash
   bun run dev
   ```
   UI 可在 `http://localhost:3000` 访问，WebSocket 端点位于 `ws://localhost:3000/ws`。

### 其他命令
- 运行生产构建：`bun run build`
- 执行测试：`bun run test`
- 监视测试：`bun run test:watch`
- 覆盖率报告：`bun run test:coverage`

## 自定义 Agent
- **系统提示词**：编辑 `ccsdk/agent-prompt.ts` 以更新 Claude 在每个会话之前收到的指令。
- **会话模板**：在 `agent/` 中填充任何启动文件（资源、React 组件等）。每当创建新会话时，它们会被复制到 `.agent/<sessionId>` 工作区。
- **工作区规则**：如果你想更改同步哪些文件或沙箱的行为方式，请查看 `ccsdk/utils/session-workspace.ts` 和相关实用程序。

## 注意事项
- 服务器使用 Bun 的原生 `Bun.serve` 和 PostCSS 管道在开发期间直接交付编译的 CSS 和 TypeScript。
- 预览利用 `@codesandbox/sandpack-react`，因此 Tailwind 类通过 CDN 加载的运行时立即渲染。
- `.agent/` 内容是一次性的，每个会话都会重新生成；如果你计划在版本控制中跟踪更改，请将其添加到 git 忽略列表中。

