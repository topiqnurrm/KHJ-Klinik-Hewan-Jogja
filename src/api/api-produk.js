// File: api-produk.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function to check user role
const checkUserRole = async () => {
    try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
            throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        if (user.aktor !== 'superadmin') {
            throw new Error('Hanya superadmin yang dapat mengakses fitur ini');
        }
        
        return true;
    } catch (error) {
        throw error;
    }
};

export const fetchProduk = async () => {
    try {
        const response = await axios.get(`${API_URL}/produk`);
        return response.data;
    } catch (error) {
        console.error('Error fetching produk data:', error);
        throw error;
    }
};

export const fetchProdukById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/produk/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching produk with id ${id}:`, error);
        throw error;
    }
};

export const createProduk = async (produkData) => {
    try {
        // Check if user is superadmin before creating produk
        await checkUserRole();
        
        const response = await axios.post(`${API_URL}/produk`, produkData, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating produk:', error);
        
        // If error is due to authorization, show message temporarily
        if (error.message === 'Hanya superadmin yang dapat mengakses fitur ini') {
            showTemporaryError(error.message);
        }
        
        throw error;
    }
};

export const updateProduk = async (id, produkData) => {
    try {
        // Check if user is superadmin before updating produk
        await checkUserRole();
        
        const response = await axios.put(`${API_URL}/produk/${id}`, produkData, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating produk with id ${id}:`, error);
        
        // If error is due to authorization, show message temporarily
        if (error.message === 'Hanya superadmin yang dapat mengakses fitur ini') {
            showTemporaryError(error.message);
        }
        
        throw error;
    }
};

export const deleteProduk = async (id) => {
    try {
        // Check if user is superadmin before deleting produk
        await checkUserRole();
        
        const response = await axios.delete(`${API_URL}/produk/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting produk with id ${id}:`, error);
        
        // If error is due to authorization, show message temporarily
        if (error.message === 'Hanya superadmin yang dapat mengakses fitur ini') {
            showTemporaryError(error.message);
        }
        
        throw error;
    }
};

// Function to show temporary error message
const showTemporaryError = (message) => {
    // Create temporary error message div
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message-popup';
    errorDiv.textContent = message;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.padding = '12px 20px';
    errorDiv.style.backgroundColor = '#ff3333';
    errorDiv.style.color = 'white';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '1000';
    
    // Add to body
    document.body.appendChild(errorDiv);
    
    // Remove after 2 seconds
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 2000);
};