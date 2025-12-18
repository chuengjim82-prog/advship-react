## React 应用调试指南

### 当前状态
- 开发服务器运行在: **http://localhost:5802**
- 构建状态: ✅ 成功 (无 TypeScript 错误)
- 服务器状态: ✅ 运行中

### 调试步骤

#### 1. 检查浏览器控制台
1. 打开浏览器，访问 `http://localhost:5802`
2. 按 F12 打开开发者工具
3. 查看 Console 标签页的错误信息
4. 查看 Network 标签页，检查资源加载状态

#### 2. 常见问题排查

**问题 A: 白屏**
- 检查控制台是否有 JavaScript 错误
- 检查 Network 中 main.tsx 是否加载成功
- 可能原因: 路径配置问题、依赖加载失败

**问题 B: 404 错误**
- 确认访问的 URL 是 `http://localhost:5802` (不是 5800 或 5801)
- 刷新页面重试

**问题 C: 模块加载失败**
- 检查 node_modules 是否完整
- 尝试重新安装依赖: `npm install`

#### 3. 快速测试

访问以下 URL 进行测试:
- 主页: `http://localhost:5802/`
- 国家管理: `http://localhost:5802/basic/country`
- 客户管理: `http://localhost:5802/partner/customer`

#### 4. 清理缓存

如果页面显示旧版本:
```bash
# 清理并重新构建
cd "D:/OSOO/Code/AdvShip/Frontend/advship-react"
rm -rf node_modules/.vite
npm run dev
```

#### 5. 浏览器兼容性

建议使用:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

### 获取详细错误信息

如果遇到问题，请提供:
1. 浏览器控制台的完整错误信息
2. Network 标签页中失败的请求
3. 访问的具体 URL
4. 浏览器类型和版本
