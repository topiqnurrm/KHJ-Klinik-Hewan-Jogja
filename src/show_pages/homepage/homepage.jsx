import React, { useEffect, useState } from "react";
import HomePage from "../../pages/homepage/HomePage.jsx";
import NavBar from "../../components/navbar/NavBar.jsx";
import ChatButton from "../../components/chat/ChatAdmin.jsx";

import './homepage.css';

function Userland() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showGreeting, setShowGreeting] = useState(!!user);
  const [userId, setUserId] = useState(null);      
  const [userIdentity, setUserIdentity] = useState(null);  // _id dari MongoDB

  useEffect(() => {
    if (user) {
      setUserId(user.user_id);
      setUserIdentity(user._id);  // ← GANTI INI
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      setUserId(null);
      setUserIdentity(null);
    }
  }, [user]);

  return (
    <>
      <NavBar userId={userId} identity={userIdentity} />
      <ChatButton />

      {showGreeting && user && (
        <div className="user-greeting-fixed">
          <div className="a">
            <h2>Selamat datang, {user.nama}!</h2>
            <p>Email kamu: {user.email}</p>
            <p>User ID kamu: {userId}</p>
            {/* <p>ID biasa kamu: {userIdentity}</p> */}
          </div>
          <div className="b">
            <button className="close-button" onClick={() => setShowGreeting(false)}>✖</button>
          </div>
        </div>
      )}

      <HomePage />
    </>
  );
}

export default Userland;
