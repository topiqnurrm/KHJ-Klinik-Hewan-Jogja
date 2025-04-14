import React, { useEffect, useState } from "react";
import HomePage from "../../pages/homepage/HomePage.jsx";
import NavBar from "../../components/navbar/NavBar.jsx";
import ChatButton from "../../components/chat/ChatAdmin.jsx";

import './homepage.css';

function Userland() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showGreeting, setShowGreeting] = useState(!!user);
  const [userId, setUserId] = useState(null);  // 👉 state untuk simpan user ID

  useEffect(() => {
    if (user) {
      setUserId(user.user_id);   // simpan ID ke state selama user masih ada
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 7000); // greeting hilang dalam 7 detik
      return () => clearTimeout(timer);
    } else {
      setUserId(null); // jika user tidak ada (logout), hapus ID
    }
  }, [user]);

  return (
    <>
      <NavBar />
      <ChatButton />

      {showGreeting && user && (
        <div className="user-greeting-fixed">
          <div className="a">
            <h2>Selamat datang, {user.nama}!</h2>
            <p>Email kamu: {user.email}</p>
            <p>ID kamu: {userId}</p>  {/* tampilkan ID kalau perlu */}
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
