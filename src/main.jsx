import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import Loginkhj from './show_pages/loginkhj/loginkhj.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Loginkhj />
  </StrictMode>,
)