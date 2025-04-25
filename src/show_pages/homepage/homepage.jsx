import React, { useEffect, useState } from "react";
import HomePage from "../../pages/homepage/HomePage.jsx";
import NavBar from "../../components/navbar/NavBar.jsx";
import ChatButton from "../../components/chat/ChatAdmin.jsx";

import './homepage.css';

import Hp4 from "../../pages/homepage/contents/hp4/hp4.jsx"; 

function Userland() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showGreeting, setShowGreeting] = useState(!!user);
  const [userId, setUserId] = useState(null);      
  const [userIdentity, setUserIdentity] = useState(null);  // _id dari MongoDB

  // Rename to be consistent with the NavBar component's expected prop
  const [refetchToggle, setRefetchToggle] = useState(false);

  const handleRefetchBooking = () => {
    setRefetchToggle(prev => !prev); // toggle untuk memicu useEffect di NavBar
  };

  useEffect(() => {
    // Hapus data yang tersisa dari sesi sebelumnya
    localStorage.removeItem("savedInput");
    localStorage.removeItem("selectedPasienData");

    if (user) {
      setUserId(user.user_id);
      setUserIdentity(user._id);
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
      <NavBar
        userId={userId}
        identity={userIdentity}
        refetchBooking={handleRefetchBooking}  // Pass the function
        refreshTrigger={refetchToggle}  // Pass the state value as the trigger
      />

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

      <HomePage 
        identity={userIdentity} 
        onBookingSaved={handleRefetchBooking}
      />

      {/* ✅ Tambahkan di sini jika ingin tampilkan Hp4 */}
      {/* <Hp4 identity={userIdentity} /> */}
    </>
  );
}

export default Userland;