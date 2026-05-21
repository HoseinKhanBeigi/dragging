import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './DraggableCards.css'
import FourVerticalDraggable from './FourVerticalDraggable.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FourVerticalDraggable />
  </StrictMode>,
)
