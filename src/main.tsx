import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ProjectionReceiver from './ProjectionReceiver'
import './index.css'

const isProjection = new URLSearchParams(window.location.search).has("proj");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isProjection ? <ProjectionReceiver /> : <App />}
  </React.StrictMode>,
)
