import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

// Auto-reload when a JS/CSS chunk fails to load (stale deployment hashes)
window.addEventListener('error', (e) => {
  if (e.target?.tagName === 'SCRIPT' || e.target?.tagName === 'LINK') {
    const src = e.target.src || e.target.href || ''
    if (src.includes('/assets/')) {
      console.warn('[chunk] Stale asset detected, reloading…', src)
      e.preventDefault()
      window.location.reload()
    }
  }
}, true)

window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason?.message || ''
  if (msg.includes('Failed to fetch') || msg.includes('Loading chunk') || msg.includes('import(')) {
    console.warn('[chunk] Dynamic import failed, reloading…', msg)
    window.location.reload()
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
