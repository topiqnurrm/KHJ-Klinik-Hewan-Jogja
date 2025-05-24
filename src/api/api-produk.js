// File: api-produk.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// 1. Ganti fungsi checkUserRole untuk create dan delete (tetap superadmin only)
const checkUserRoleForCreateDelete = async () => {
    try {
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

// 2. Buat fungsi baru untuk check role edit (superadmin dan paramedis)
const checkUserRoleForEdit = async () => {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            throw new Error('User not authenticated');
        }
        
        const user = JSON.parse(userData);
        if (user.aktor !== 'superadmin' && user.aktor !== 'paramedis') {
            throw new Error('Hanya superadmin dan paramedis yang dapat mengedit produk');
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

// 3. GANTI fungsi createProduk (tetap superadmin only):
export const createProduk = async (produkData) => {
    try {
        // Check if user is superadmin before creating produk
        await checkUserRoleForCreateDelete();
        
        const response = await axios.post(`${API_URL}/produk`, produkData, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating produk:', error);
        
        if (error.message === 'Hanya superadmin yang dapat mengakses fitur ini') {
            showTemporaryError(error.message);
        }
        
        throw error;
    }
};

// 4. GANTI fungsi updateProduk (superadmin dan paramedis):
export const updateProduk = async (id, produkData) => {
    try {
        // Check if user is superadmin or paramedis before updating produk
        await checkUserRoleForEdit();
        
        const response = await axios.put(`${API_URL}/produk/${id}`, produkData, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating produk with id ${id}:`, error);
        
        if (error.message === 'Hanya superadmin dan paramedis yang dapat mengedit produk') {
            showTemporaryError(error.message);
        }
        
        throw error;
    }
};

// 5. GANTI fungsi deleteProduk (tetap superadmin only):
export const deleteProduk = async (id) => {
    try {
        // Check if user is superadmin before deleting produk
        await checkUserRoleForCreateDelete();
        
        const response = await axios.delete(`${API_URL}/produk/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting produk with id ${id}:`, error);
        
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