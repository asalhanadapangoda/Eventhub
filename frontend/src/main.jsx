import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './modules/event-and-space/index.css'
import './common/tailwind-modules.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
