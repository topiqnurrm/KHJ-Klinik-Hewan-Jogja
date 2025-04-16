import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // <== Tambahkan ini
import './main.css'
import Userland from './show_pages/homepage/homepage.jsx'
import Login from './show_pages/loginkhj/loginkhj.jsx'

const user = JSON.parse(localStorage.getItem("user"))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {<Userland />}
    </BrowserRouter>
  </StrictMode>,
)
