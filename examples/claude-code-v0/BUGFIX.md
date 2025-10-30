# 🐛 Bug 修复记录

## 问题描述

在启动服务器时遇到语法错误：

```bash
error: Expected "}" but found "."
    at /Users/.../ccsdk/agent-prompt.ts:98:37
```

### 原因

在 `agent-prompt.ts` 第 98 行，示例代码中使用了 n8n 的变量语法 `${{$json.price_usd}}`，但这与 JavaScript 模板字符串的插值语法 `${}` 冲突。

### 错误代码
```typescript
"text": "BTC Price: ${{$json.price_usd}}"  // ❌ 错误
```

### 修复方案

转义 `$` 符号，防止被解释为模板字符串插值：

```typescript
"text": "BTC Price: \${{\\$json.price_usd}}"  // ✅ 正确
```

## 修复状态

✅ **已修复** (2025-10-27)

## 验证

编译测试通过：
```bash
$ bun build ccsdk/agent-prompt.ts --target=node
# Exit code: 0 (成功)
```

## 现在可以正常启动

```bash
bun run dev
```

服务器将在 http://localhost:3000 启动，无语法错误。

---

## 技术说明

### JavaScript 模板字符串转义规则

在模板字符串（反引号 \`...\` 包裹）中：

1. **`${}`** - 模板插值，用于执行 JavaScript 表达式
2. **`\${}`** - 转义后的普通文本，不执行插值
3. **`\\$`** - 转义 `$` 本身

### n8n 变量语法

n8n 使用 `{{...}}` 语法来引用数据：
- `{{$json.fieldName}}` - 引用 JSON 数据的字段
- `{{$node["NodeName"].json.field}}` - 引用特定节点的输出

### 在 TypeScript/JavaScript 中使用

当在 JavaScript/TypeScript 代码中写 n8n 配置示例时，需要转义：

```typescript
// 错误 ❌
const example = `{
  "text": "${{$json.price}}"
}`;

// 正确 ✅  
const example = `{
  "text": "\${{\\$json.price}}"
}`;
```

---

## 相关文件

- **修复文件**: `ccsdk/agent-prompt.ts`
- **修复行数**: 第 98 行
- **修复类型**: 语法错误

---

*修复时间: 2025-10-27*  
*状态: ✅ 已解决*

