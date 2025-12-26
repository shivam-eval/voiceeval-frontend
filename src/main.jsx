import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WorkflowProvider } from './context/WorkflowContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkflowProvider>
        <App />
      </WorkflowProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

