import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import Homepage from './show_pages/homepage/homepage.jsx'
import Loginkhj from './show_pages/loginkhj/loginkhj.jsx'
import Adminkhj from './show_pages/adminkhj/adminkhj.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Loginkhj />
  </StrictMode>,
)