import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// 简单测试版本 - 绕过所有复杂组件
function SimpleTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>React 应用测试页面</h1>
      <p>✓ React 已成功加载</p>
      <p>✓ TypeScript 工作正常</p>
      <p>✓ Vite 开发服务器运行中</p>
      <hr />
      <p>如果您能看到这个页面，说明基础配置是正确的。</p>
      <p>当前时间: {new Date().toLocaleString()}</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleTest />
  </StrictMode>,
)
