import React from "react";
import HomePage from "../../pages/homepage/HomePage.jsx";
import NavBar from "../../components/navbar/NavBar.jsx";

import ChatButton from "../../components/chat/ChatAdmin.jsx";

import './homepage.css'

function userland() {

  return (
    <>
      <NavBar />
      <ChatButton />
      <HomePage />
    </>
  )
}

export default userland
