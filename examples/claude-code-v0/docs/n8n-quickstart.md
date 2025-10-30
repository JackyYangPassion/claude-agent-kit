# n8n 工作流生成器 - 快速开始（5分钟）

## 🚀 快速开始

### 步骤 1: 启动 n8n (2分钟)

```bash
# 安装 n8n（如果还没有）
npm install -g n8n

# 启动 n8n
n8n start
```

访问 http://localhost:5678，完成 n8n 的初始设置。

### 步骤 2: 获取 n8n API Key (1分钟)

1. 在 n8n 界面中，进入 **Settings** → **API**
2. 点击 **Create API Key**
3. 复制生成的 API Key

### 步骤 3: 配置环境变量 (1分钟)

在项目根目录创建或编辑 `.env` 文件：

```bash
# Claude API Key
ANTHROPIC_API_KEY=sk-ant-xxxxx

# n8n Configuration
N8N_API_URL=http://localhost:5678/
N8N_API_KEY=你的n8n_api_key
```

### 步骤 4: 启动应用 (1分钟)

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

访问 http://localhost:3000

### 步骤 5: 创建第一个工作流！(30秒)

在聊天框中输入：

```
每分钟获取一次北京时间，发送到控制台日志
```

或

```
每5分钟检查 https://www.google.com 是否可访问，如果不可访问则记录日志
```

🎉 完成！您的第一个自动化工作流已创建！

---

## 📝 更多示例

### 示例 1: 价格监控
```
每10分钟从 https://api.coindesk.com/v1/bpi/currentprice.json 获取比特币价格
```

### 示例 2: 定时任务
```
每天早上9点执行一次，记录当前时间戳
```

### 示例 3: 数据处理
```
获取 https://jsonplaceholder.typicode.com/todos 的数据，提取前5条，格式化后输出
```

---

## 🔧 验证工作流

1. 在聊天界面中，点击工作流卡片上的 **"在 n8n 中打开"** 按钮
2. 在 n8n 界面中，点击右上角的 **"Test workflow"** 或 **"Execute workflow"**
3. 查看执行结果

---

## ❓ 遇到问题？

### 问题 1: "无法连接到 n8n"
- 确认 n8n 正在运行（访问 http://localhost:5678）
- 检查 `.env` 文件中的 `N8N_API_URL` 是否正确

### 问题 2: "API Key 无效"
- 重新生成 n8n API Key
- 确认 `.env` 文件中的 `N8N_API_KEY` 正确无误
- 重启应用（`bun run dev`）

### 问题 3: "工作流创建失败"
- 查看浏览器控制台（F12）的错误信息
- 查看终端的服务器日志
- 确保描述足够清晰和具体

---

## 📚 下一步

- 阅读完整的[使用指南](./n8n-workflow-usage.md)
- 了解[设计文档](./n8n-workflow-generator-design.md)
- 探索更多[n8n 节点](https://docs.n8n.io/integrations/builtin/)

---

## 💡 提示

- **清晰描述**：越具体的描述，生成的工作流越准确
- **分步实现**：复杂工作流可以分步创建，逐步完善
- **测试优先**：创建后先在 n8n 中测试，确认无误后再激活
- **查看日志**：遇到问题时，查看执行历史可以快速定位问题

祝您使用愉快！🎉

