import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 이거 추가
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 여기서 감싸줍니다! */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
