#!/bin/bash
# n8n 工作流生成器快速验证脚本

echo "🧪 开始测试 n8n 工作流生成器..."
echo ""

# 1. 检查 n8n
echo "1️⃣ 检查 n8n 服务..."
if curl -s http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ n8n 服务正常运行 (http://localhost:5678)"
else
    echo "❌ n8n 服务未运行"
    echo "   请运行: npm install -g n8n && n8n start"
    exit 1
fi
echo ""

# 2. 检查环境变量
echo "2️⃣ 检查环境变量配置..."
if [ -f .env ]; then
    echo "✅ 找到 .env 文件"
    
    if grep -q "ANTHROPIC_API_KEY" .env && ! grep -q "ANTHROPIC_API_KEY=your" .env; then
        echo "✅ ANTHROPIC_API_KEY 已配置"
    else
        echo "⚠️  ANTHROPIC_API_KEY 未配置或使用默认值"
    fi
    
    if grep -q "N8N_API_KEY" .env && ! grep -q "N8N_API_KEY=your" .env; then
        echo "✅ N8N_API_KEY 已配置"
    else
        echo "❌ N8N_API_KEY 未配置"
        echo "   请在 n8n 界面中生成 API Key 并添加到 .env 文件"
        exit 1
    fi
    
    if grep -q "N8N_API_URL" .env; then
        echo "✅ N8N_API_URL 已配置"
    else
        echo "⚠️  N8N_API_URL 未配置，将使用默认值"
    fi
else
    echo "❌ 未找到 .env 文件"
    echo "   请创建 .env 文件并配置必要的环境变量"
    echo "   示例:"
    echo "   ANTHROPIC_API_KEY=your_key"
    echo "   N8N_API_URL=http://localhost:5678/"
    echo "   N8N_API_KEY=your_n8n_key"
    exit 1
fi
echo ""

# 3. 检查 Bun
echo "3️⃣ 检查 Bun 运行时..."
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo "✅ Bun 已安装 (版本: $BUN_VERSION)"
else
    echo "❌ Bun 未安装"
    echo "   请访问 https://bun.sh 安装 Bun"
    exit 1
fi
echo ""

# 4. 检查依赖
echo "4️⃣ 检查项目依赖..."
if [ -d "node_modules" ]; then
    echo "✅ 依赖已安装"
else
    echo "⚠️  依赖未安装，正在安装..."
    bun install
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装完成"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi
echo ""

# 5. 检查关键文件
echo "5️⃣ 检查关键文件..."
files=(
    "ccsdk/workflow-service.ts"
    "ccsdk/agent-prompt.ts"
    "ccsdk/ai-client.ts"
    "ccsdk/session.ts"
    "client/components/workflow/workflow-card.tsx"
    "client/components/workflow/workflow-list.tsx"
    "client/components/chat-interface.tsx"
    "shared/types/messages.ts"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ 缺少 $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo ""
    echo "❌ 部分关键文件缺失，请检查代码完整性"
    exit 1
fi
echo ""

# 6. 检查文档
echo "6️⃣ 检查文档..."
docs=(
    "docs/n8n-workflow-generator-design.md"
    "docs/n8n-workflow-usage.md"
    "docs/n8n-quickstart.md"
    "docs/n8n-testing-checklist.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc"
    else
        echo "⚠️  未找到 $doc"
    fi
done
echo ""

# 7. TypeScript 类型检查（可选）
echo "7️⃣ TypeScript 类型检查..."
if command -v tsc &> /dev/null; then
    echo "运行 TypeScript 编译检查..."
    tsc --noEmit 2>&1 | head -20
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "✅ TypeScript 类型检查通过"
    else
        echo "⚠️  存在 TypeScript 类型错误（可能不影响运行）"
    fi
else
    echo "⚠️  TypeScript 编译器未找到，跳过类型检查"
fi
echo ""

# 总结
echo "================================================"
echo "🎉 所有必要检查通过！"
echo "================================================"
echo ""
echo "📖 接下来："
echo ""
echo "1. 启动开发服务器："
echo "   $ bun run dev"
echo ""
echo "2. 访问应用："
echo "   http://localhost:3000"
echo ""
echo "3. 在聊天界面中尝试创建工作流："
echo "   例如：每分钟获取一次北京时间并记录"
echo ""
echo "4. 查看文档："
echo "   - 快速开始: docs/n8n-quickstart.md"
echo "   - 使用指南: docs/n8n-workflow-usage.md"
echo "   - 测试清单: docs/n8n-testing-checklist.md"
echo ""
echo "祝使用愉快！🚀"

