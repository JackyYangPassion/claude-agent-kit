# 🚀 从这里开始 - n8n 工作流生成器

欢迎使用 n8n 工作流生成器！这个指南将帮助您在 5 分钟内开始使用。

---

## ⚡ 快速开始（5 步骤）

### 步骤 1: 启动 n8n (2 分钟)

```bash
# 如果还没有安装 n8n
npm install -g n8n

# 启动 n8n
n8n start
```

访问 http://localhost:5678 并完成初始设置。

### 步骤 2: 获取 n8n API Key (1 分钟)

1. 在 n8n 界面中，进入 **Settings** → **API**
2. 点击 **Create API Key**
3. 复制生成的 API Key

### 步骤 3: 配置环境变量 (1 分钟)

创建或编辑项目根目录的 `.env` 文件：

```bash
# Claude API Key
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# n8n Configuration
N8N_API_URL=http://localhost:5678/
N8N_API_KEY=你刚才复制的n8n_api_key
```

> **重要**: 将 `sk-ant-xxxxxxxxxxxxx` 和 `你刚才复制的n8n_api_key` 替换为实际的密钥！

### 步骤 4: 验证配置 (30 秒)

运行验证脚本：

```bash
./test-n8n-setup.sh
```

如果所有检查都通过 ✅，继续下一步。

### 步骤 5: 启动应用 (30 秒)

```bash
# 如果依赖未安装
bun install

# 启动开发服务器
bun run dev
```

访问 http://localhost:3000

---

## 🎯 创建第一个工作流

在聊天界面中输入：

```
每分钟获取一次 https://jsonplaceholder.typicode.com/todos/1 的数据
```

几秒钟后，您会看到：
- ✅ 工作流创建成功的消息
- 📋 工作流卡片（显示名称、状态、节点信息）
- 🔗 "在 n8n 中打开" 按钮

点击按钮，在 n8n 中查看和管理您的工作流！

---

## 📚 更多示例

### 示例 1: 定时任务
```
每天早上 9 点执行一次任务
```

### 示例 2: API 监控
```
每 5 分钟检查 https://api.github.com 是否可访问
```

### 示例 3: 数据处理
```
获取 https://jsonplaceholder.typicode.com/users 的前 3 个用户信息
```

### 示例 4: 复杂流程
```
每小时从 https://api.coindesk.com/v1/bpi/currentprice.json 获取比特币价格，如果价格大于 60000 美元则记录到日志
```

---

## 📖 完整文档

### 推荐阅读顺序

1. **[快速开始指南](./docs/n8n-quickstart.md)** (5 分钟阅读)
   - 详细的设置步骤
   - 常见问题解答
   - 基础示例

2. **[使用指南](./docs/n8n-workflow-usage.md)** (15 分钟阅读)
   - 支持的功能
   - 高级用法
   - 实际应用场景
   - 最佳实践

3. **[设计文档](./docs/n8n-workflow-generator-design.md)** (技术人员)
   - 系统架构
   - 数据流设计
   - API 文档

4. **[测试清单](./docs/n8n-testing-checklist.md)** (开发/测试)
   - 完整测试用例
   - 验证步骤
   - 故障排查

5. **[实现总结](./docs/n8n-implementation-summary.md)** (技术细节)
   - 技术栈
   - 代码结构
   - 开发时间线

---

## 🔧 常见问题

### Q: 工作流创建失败？
**A**: 检查以下几点：
1. n8n 是否正在运行？（访问 http://localhost:5678）
2. `.env` 文件中的 API Key 是否正确？
3. 运行 `./test-n8n-setup.sh` 验证配置

### Q: 看不到工作流卡片？
**A**: 
1. 确保您的描述足够具体（包含触发条件和操作）
2. 查看浏览器控制台（F12）是否有错误
3. 查看服务器终端日志

### Q: 如何修改已创建的工作流？
**A**: 
1. 点击工作流卡片上的 "在 n8n 中打开" 按钮
2. 在 n8n 界面中编辑节点和连接
3. 保存并激活工作流

---

## 🎨 UI 功能说明

### 工作流卡片
每个创建的工作流都会显示为一个卡片，包含：

- **🔄 图标和名称**: 工作流的名称
- **状态徽章**: 
  - 🟢 运行中
  - ⏸️ 已停止
- **⏰ 触发器**: 显示触发方式（如 "每 1 分钟"）
- **🔧 节点数**: 工作流包含的节点总数
- **流程图**: 节点的连接顺序
- **操作按钮**:
  - 🔗 在 n8n 中打开
  - 📋 复制链接

### 实时更新
- 工作流创建过程中显示加载动画
- 创建成功后立即显示卡片
- 支持同时管理多个工作流

---

## 💡 使用技巧

### 1. 清晰的描述
```
✅ 好: "每 5 分钟从 https://api.example.com/data 获取数据并记录"
❌ 差: "获取数据"
```

### 2. 指定触发频率
```
✅ 好: "每天早上 9 点"
❌ 差: "定期执行"
```

### 3. 明确数据源
```
✅ 好: "从 MySQL 数据库的 users 表"
❌ 差: "从数据库"
```

### 4. 详细的操作
```
✅ 好: "提取 price 字段，如果大于 100 则发送通知"
❌ 差: "处理数据"
```

---

## 🚨 故障排查

### 命令速查

```bash
# 检查 n8n 状态
curl http://localhost:5678

# 查看项目日志（启动后）
# 直接在终端查看输出

# 验证配置
./test-n8n-setup.sh

# 重启应用
# Ctrl+C 停止，然后重新运行
bun run dev
```

### 日志位置
- **服务器日志**: 终端输出（运行 `bun run dev` 的终端）
- **浏览器日志**: 开发者工具 Console (F12)
- **n8n 日志**: n8n 界面 → Executions 标签

---

## 🌟 下一步

### 探索更多功能
- 创建不同类型的工作流（API 监控、数据同步、通知等）
- 在 n8n 中编辑和优化工作流
- 查看工作流执行历史和日志

### 深入学习
- 阅读 [n8n 官方文档](https://docs.n8n.io/)
- 了解 [n8n 节点库](https://docs.n8n.io/integrations/builtin/)
- 探索 [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)

### 贡献
- 报告问题或建议
- 分享您的使用经验
- 贡献代码或文档

---

## 📞 获取帮助

### 查看文档
1. [快速开始](./docs/n8n-quickstart.md) - 解决设置问题
2. [使用指南](./docs/n8n-workflow-usage.md) - 功能使用帮助
3. [测试清单](./docs/n8n-testing-checklist.md) - 验证功能

### 调试步骤
1. 运行 `./test-n8n-setup.sh` 验证配置
2. 查看浏览器控制台（F12）
3. 查看服务器终端日志
4. 检查 n8n 执行历史

### 社区资源
- n8n 社区论坛
- GitHub Issues
- 官方文档

---

## 🎉 开始您的自动化之旅！

现在您已经准备好了！打开聊天界面，用自然语言描述您想要自动化的任务，让 AI 为您创建工作流。

**记住**: 描述越具体，生成的工作流越准确！

祝您使用愉快！🚀

---

*最后更新: 2025-10-27*

