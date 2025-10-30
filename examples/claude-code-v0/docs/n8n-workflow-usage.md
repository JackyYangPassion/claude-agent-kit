# n8n 工作流生成器使用指南

## 快速开始

### 1. 环境准备

#### 1.1 启动 n8n
确保 n8n 正在运行：
```bash
# 如果还没有安装 n8n
npm install -g n8n

# 启动 n8n
n8n start

# n8n 将运行在 http://localhost:5678
```

#### 1.2 获取 n8n API Key
1. 打开 n8n 界面：http://localhost:5678
2. 登录您的账户
3. 进入 Settings → API
4. 生成或复制 API Key

#### 1.3 配置环境变量
在项目根目录创建 `.env` 文件（如果不存在）：
```bash
# Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key

# n8n Configuration
N8N_API_URL=http://localhost:5678/
N8N_API_KEY=your_n8n_api_key_here
```

**注意**：将 `your_n8n_api_key_here` 替换为您在步骤 1.2 中获取的 API Key。

### 2. 启动应用

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 创建您的第一个工作流

在聊天界面中输入自然语言描述，例如：

**示例 1：比特币价格监控**
```
每分钟通过 https://coinmarketcap.com/currencies/bitcoin/ 获取 BTC 的价格并发送到 Telegram
```

**示例 2：GitHub 通知**
```
当有人给我的 GitHub 仓库提 issue 时，发送通知到 Slack
```

**示例 3：定时数据同步**
```
每天早上 9 点从 Google Sheets 读取数据，并保存到 PostgreSQL 数据库
```

**示例 4：邮件自动回复**
```
监听我的邮箱，当收到包含"报价"关键词的邮件时，自动回复固定模板
```

### 4. 查看和管理工作流

创建成功后，您会看到：
- ✅ 确认消息
- 📋 工作流卡片，显示：
  - 工作流名称
  - 运行状态（运行中/已停止）
  - 触发器信息
  - 节点数量
  - 流程图
  - 操作按钮

点击 **"在 n8n 中打开"** 按钮可以在 n8n 界面中查看和编辑工作流的详细配置。

---

## 高级用法

### 支持的触发器类型

1. **定时触发（Schedule Trigger）**
   - "每分钟"
   - "每小时"
   - "每天 [时间]"
   - "每周 [星期]"
   - "每月 [日期]"

2. **Webhook 触发**
   - "当接收到 POST 请求"
   - "当调用 API"
   - "webhook"

3. **手动触发（Manual Trigger）**
   - "手动执行"
   - "按需运行"

### 支持的常用节点

#### 数据获取
- **HTTP Request**: 从任何 API 或网站获取数据
- **Google Sheets**: 读取/写入 Google 表格
- **Airtable**: 访问 Airtable 数据库
- **Database** (MySQL, PostgreSQL, MongoDB, Redis)

#### 数据处理
- **Code (JavaScript/Python)**: 自定义数据处理逻辑
- **Set**: 设置/转换数据字段
- **Function**: 执行复杂的数据转换
- **Split In Batches**: 批量处理数据
- **Merge**: 合并多个数据流

#### 通知
- **Telegram**: 发送 Telegram 消息
- **Slack**: 发送 Slack 通知
- **Email Send**: 发送邮件
- **Discord**: 发送 Discord 消息
- **SMS**: 发送短信（需配置服务商）

#### 集成服务
- **GitHub**: 仓库、Issue、PR 操作
- **GitLab**: 项目管理
- **Notion**: 数据库和页面操作
- **Jira**: 任务和项目管理
- **Trello**: 卡片和看板管理

### 使用技巧

#### 1. 清晰描述触发条件
```
✅ 好: "每分钟检查一次"
❌ 差: "定期检查"

✅ 好: "每天早上 9 点"
❌ 差: "早上"
```

#### 2. 明确指定数据源
```
✅ 好: "从 https://api.example.com/data 获取 JSON 数据"
❌ 差: "获取数据"

✅ 好: "从 MySQL 数据库的 users 表查询"
❌ 差: "查询数据库"
```

#### 3. 详细说明处理逻辑
```
✅ 好: "提取 price 字段，如果大于 50000 则发送警告"
❌ 差: "处理价格"
```

#### 4. 指定输出目标和格式
```
✅ 好: "发送到 Telegram 群组，消息格式：BTC 价格：$[price]"
❌ 差: "发送通知"
```

---

## 常见问题

### Q1: 工作流创建失败怎么办？
**A**: 检查以下几点：
1. n8n 是否正常运行（访问 http://localhost:5678）
2. N8N_API_KEY 是否正确配置
3. 描述是否足够清晰和具体
4. 查看浏览器控制台和服务器日志获取详细错误信息

### Q2: 工作流创建成功但没有运行？
**A**: 
1. 在 n8n 界面中打开工作流
2. 检查工作流是否已激活（右上角开关）
3. 检查触发器配置是否正确
4. 对于 HTTP Request 节点，确保目标 URL 可访问
5. 对于需要认证的服务（如 Telegram），确保配置了正确的凭据

### Q3: 如何配置 Telegram Bot？
**A**:
1. 在 Telegram 中搜索 @BotFather
2. 发送 `/newbot` 创建新 bot
3. 获取 Bot Token
4. 在 n8n 中配置 Telegram credentials，输入 Bot Token
5. 获取您的 Chat ID（可以使用 @userinfobot）
6. 在工作流描述中提供 Chat ID

### Q4: 如何获取网页数据？
**A**: 
- 对于有 API 的服务，直接使用 API endpoint
- 对于没有 API 的网页：
  1. 使用 HTTP Request 节点获取 HTML
  2. 使用 Code 节点配合 cheerio 库解析 HTML
  3. 或在描述中说明需要"抓取网页数据"，AI 会帮您配置

### Q5: 工作流可以处理多少数据？
**A**: 
- 依赖于 n8n 配置和服务器资源
- 建议对大量数据使用 "Split In Batches" 节点分批处理
- 对于高频触发，注意 API 速率限制

### Q6: 可以编辑已创建的工作流吗？
**A**: 
是的！点击工作流卡片上的"在 n8n 中打开"按钮，在 n8n 界面中可以：
- 修改节点配置
- 添加/删除节点
- 调整工作流逻辑
- 测试和调试

### Q7: 支持哪些编程语言进行数据处理？
**A**: 
n8n 的 Code 节点支持：
- JavaScript (Node.js)
- Python

在描述中可以说明："使用 JavaScript 处理..." 或 "使用 Python 计算..."

---

## 实际应用场景

### 1. 加密货币价格监控
```
每 5 分钟获取 BTC、ETH 的价格，当价格变化超过 5% 时发送 Telegram 通知
```

### 2. 服务器监控
```
每分钟检查 https://myapp.com 是否可访问，如果返回错误则发送邮件告警
```

### 3. 社交媒体自动化
```
每天早上 8 点从 RSS feed 获取最新文章，自动发布到 Twitter
```

### 4. 数据备份
```
每天凌晨 2 点从 MySQL 导出数据，保存到 Google Drive
```

### 5. 客户支持自动化
```
监听客服邮箱，自动分类邮件（咨询/投诉/建议），并转发给对应负责人
```

### 6. 报表生成
```
每周一早上生成上周的销售报表（从数据库查询），发送 PDF 到管理团队邮箱
```

### 7. GitHub 工作流
```
当主分支有新的 PR 时，运行测试，结果通过 Slack 通知团队
```

### 8. 内容聚合
```
每小时从多个新闻 API 获取科技新闻，去重后保存到 Notion 数据库
```

---

## 最佳实践

### 1. 工作流命名规范
使用清晰、描述性的名称：
```
✅ 好: "BTC价格监控-Telegram通知"
✅ 好: "每日销售报表-邮件发送"
❌ 差: "workflow1"
❌ 差: "测试"
```

### 2. 错误处理
在描述中提及错误处理：
```
"获取 API 数据，如果失败则重试 3 次，仍失败则发送错误通知"
```

### 3. 日志记录
对于重要工作流，添加日志节点：
```
"每次执行后将结果记录到 Google Sheets"
```

### 4. 测试优先
创建新工作流后：
1. 先在 n8n 中手动测试
2. 检查每个节点的输出
3. 确认无误后再激活定时触发

### 5. 安全考虑
- 不要在描述中包含敏感信息（密码、密钥等）
- 在 n8n 界面中使用 Credentials 管理认证信息
- 对于 Webhook，设置认证或使用难以猜测的 URL

---

## 故障排查

### 服务器日志
启动时添加日志级别：
```bash
LOG_LEVEL=debug bun run dev
```

### 浏览器控制台
打开浏览器开发者工具（F12），查看 Console 和 Network 标签页。

### n8n 执行历史
在 n8n 界面中：
1. 打开工作流
2. 点击 "Executions" 标签
3. 查看每次执行的详细日志

### 常见错误代码

- **401 Unauthorized**: API Key 错误或过期
- **404 Not Found**: n8n URL 配置错误
- **429 Too Many Requests**: API 速率限制，降低触发频率
- **500 Internal Server Error**: 检查 n8n 服务状态和节点配置

---

## 更新日志

### v1.0.0 (2025-10-27)
- ✨ 首次发布
- 🤖 集成 Claude AI 进行自然语言理解
- 🔗 支持 n8n MCP 协议
- 📊 工作流可视化展示
- 🎯 支持 20+ 常用节点类型

---

## 技术支持

如遇到问题：
1. 查看本文档的"常见问题"和"故障排查"部分
2. 检查服务器和浏览器日志
3. 访问 n8n 官方文档：https://docs.n8n.io/
4. 提交 Issue 到项目仓库

---

## 参考资源

- [n8n 官方文档](https://docs.n8n.io/)
- [n8n 节点库](https://docs.n8n.io/integrations/builtin/)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- [n8n MCP](https://github.com/n8n-io/n8n-mcp)

