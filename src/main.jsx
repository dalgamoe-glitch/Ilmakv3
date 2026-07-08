import React from 'react'
import ReactDOM from 'react-dom/client'
// must precede the App import: ES module evaluation order determines CSS
// cascade order here, and global.css's base rules (e.g. .glass) need to load
// before sections.css so sections.css's more specific mobile overrides win
import './styles/global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
