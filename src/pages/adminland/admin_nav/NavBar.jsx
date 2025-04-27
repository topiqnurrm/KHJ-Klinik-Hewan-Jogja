import React, { useState, useRef, useEffect } from "react";
import logo from "./image/logo.png";
import Logout from "./image/logout.png";
import userImg from "./popup_nav/gambar/default.png"; // Add default user image
import "./NavBar.css";
import UserProfile from "./popup_nav/userprofile"; // Import the UserProfile component
import { getUserById } from "../../../api/api-user"; // Import the API function

const NavBar = () => {
    const [showProfile, setShowProfile] = useState(false);
    const profileButtonRef = useRef(null);
    const [userData, setUserData] = useState(null);
    
    // Get user data from localStorage
    useEffect(() => {
        const userJSON = localStorage.getItem('user');
        if (userJSON) {
            const user = JSON.parse(userJSON);
            setUserData(user);
        } else {
            // Fallback to API call if user data isn't in localStorage
            const fetchUserData = async () => {
                const userJSON = localStorage.getItem('user');
                const user = userJSON ? JSON.parse(userJSON) : null;
                const identity = user ? user._id || user.id : null;
                
                if (identity) {
                    try {
                        const result = await getUserById(identity);
                        if (result) {
                            setUserData(result);
                        } else {
                            console.warn("User data not found");
                        }
                    } catch (error) {
                        console.error("Failed to fetch user data:", error);
                    }
                }
            };
            
            fetchUserData();
        }
    }, []);
    
    const handleProfileClick = () => {
        setShowProfile((prev) => !prev);
    };
    
    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        // Redirect to login page or refresh
        window.location.href = '/'; // Adjust the path as needed
    };
    
    // Get user ID for profile component
    const userJSON = localStorage.getItem('user');
    const user = userJSON ? JSON.parse(userJSON) : null;
    const identity = user ? user._id || user.id : null;
    
    return (
        <nav className="admin_nav">
            <img
                src={logo}
                alt="Logo"
                className="logo"
            />

            {/* User info section */}
            <div>
                <div className="message-icon">
                    <a 
                        href="#pesanan" 
                        style={{ textDecoration: "none" }}
                        ref={profileButtonRef}
                        onClick={(e) => {
                            e.preventDefault();
                            handleProfileClick();
                        }}
                    >
                       <span className="user-name">
                           {userData ? `${userData.nama}, (${userData.aktor})` : "Loading..."}
                       </span>
                    </a>
                </div>
            </div>

            {/* Logout Button */}
            {/* <a 
                href="#logout" 
                className="exit" 
                style={{ textDecoration: "none" }}
                onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                }}
            >
                <span className="user-id">Log Out</span>
                <img src={Logout} alt="User" className="user-img" />
            </a> */}
            
            {/* Profile Popup */}
            <UserProfile
                isVisible={showProfile}
                onClose={() => setShowProfile(false)}
                triggerRef={profileButtonRef}
                identity={identity}
            />
        </nav>
    );
};

export default NavBar;