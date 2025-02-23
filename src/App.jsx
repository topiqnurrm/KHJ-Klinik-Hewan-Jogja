import React from "react";
import HomePage from "./pages/homepage/HomePage.jsx";
import NavBar from "./components/navbar/NavBar.jsx";

import ChatButton from "./components/chat/ChatAdmin.jsx";

import './App.css'

function App() {

  return (
    <>
      <NavBar />
      <ChatButton />
      <HomePage />
    </>
  )
}

export default App
