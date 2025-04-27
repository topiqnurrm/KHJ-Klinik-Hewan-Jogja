// src/pages/homepage/Userland.jsx

import React, { useEffect, useState } from "react";
import HomePage from "../../pages/homepage/HomePage.jsx";
import NavBar from "../../components/navbar/NavBar.jsx";
import ChatButton from "../../components/chat/ChatAdmin.jsx";

import './homepage.css';

import Hp4 from "../../pages/homepage/contents/hp4/hp4.jsx"; 
import ProtectedRoute from "../../ProtectedRoute.jsx";

function Userland() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [showGreeting, setShowGreeting] = useState(!!user);
  const [userId, setUserId] = useState(user ? user.user_id : null);      
  const [userIdentity, setUserIdentity] = useState(user ? user._id : null);  
  const [refetchToggle, setRefetchToggle] = useState(false);

  const handleRefetchBooking = () => {
    setRefetchToggle(prev => !prev); // toggle untuk trigger refresh
  };

  useEffect(() => {
    // Hapus data sisa session
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
      {/* Navbar */}
      <NavBar
        userId={userId}
        identity={userIdentity}
        refetchBooking={handleRefetchBooking}
        refreshTrigger={refetchToggle}
      />

      {/* Chat Button */}
      <ChatButton />

      {/* Greeting popup */}
      {showGreeting && user && (
        <div className="user-greeting-fixed">
          <div className="a">
            <h2>Selamat datang, {user.nama}!</h2>
            <p>Email kamu: {user.email}</p>
            <p>User ID kamu: {userId}</p>
          </div>
          <div className="b">
            <button className="close-button" onClick={() => setShowGreeting(false)}>✖</button>
          </div>
        </div>
      )}

      {/* HomePage content */}
      <>
        {user ? (
          <ProtectedRoute allowedRoles={["klien", ""]}>
            <HomePage 
              identity={userIdentity}
              onBookingSaved={handleRefetchBooking}
            />
          </ProtectedRoute>
        ) : (
          <HomePage 
            identity={userIdentity}
            onBookingSaved={handleRefetchBooking}
          />
        )}
      </>

      {/* Optional: Page tambahan */}
      {/* <Hp4 identity={userIdentity} /> */}
    </>
  );
}

export default Userland;
