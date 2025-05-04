import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Function to check if the user is authenticated
    const checkAuthStatus = async () => {
        try {
            // Get token from local storage
            const token = localStorage.getItem('token');
            
            if (!token) {
                setLoading(false);
                return;
            }
            
            // Validate token with the server
            const response = await axios.get('http://localhost:5000/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Set current user data
            setCurrentUser(response.data);
        } catch (err) {
            console.error('Authentication error:', err);
            setError(err.message);
            // Clear invalid token
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };
    
    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            
            // Save token
            localStorage.setItem('token', response.data.token);
            
            // Set user data
            setCurrentUser(response.data.user);
            
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    };
    
    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };
    
    // Check auth status on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);
    
    // Context value
    const value = {
        currentUser,
        loading,
        error,
        login,
        logout,
        checkAuthStatus
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;