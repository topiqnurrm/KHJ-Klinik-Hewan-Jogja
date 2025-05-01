import axios from 'axios';

// Helper function to check if user is superadmin
const isSuperAdmin = () => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      return userData.aktor === 'superadmin';
    }
    return false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Function to create a temporary error message and return a rejected promise
const createTemporaryError = (message) => {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message-floating';
  errorElement.textContent = message;
  document.body.appendChild(errorElement);
  
  // Remove after 2 seconds
  setTimeout(() => {
    document.body.removeChild(errorElement);
  }, 2000);
  
  return Promise.reject(new Error(message));
};

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Original function - fetches layanan and returns them in react-select format
export const fetchLayanan = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/pelayanan");
    const layananData = response.data;

    // Urutkan dari yang terbaru (createdAt paling akhir)
    const sortedLayanan = layananData.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Mapping ke react-select format
    return sortedLayanan.map((item) => ({
      value: item._id,
      label: item.nama,
    }));
  } catch (error) {
    console.error("Error fetching layanan:", error);
    return [];
  }
};

// New function - fetches all layanan data
export const getAllLayanan = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/pelayanan");
    return response.data;
  } catch (error) {
    console.error("Error fetching all layanan data:", error);
    throw error;
  }
};

// Function to delete a layanan with role validation
export const deleteLayanan = async (id) => {
  // Check if user is superadmin
  if (!isSuperAdmin()) {
    return createTemporaryError("Hanya superadmin yang dapat menghapus layanan");
  }

  try {
    const response = await axios.delete(`http://localhost:5000/api/pelayanan/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting layanan:", error);
    // If server returns 403 error, show permission message
    if (error.response?.status === 403) {
      return createTemporaryError("Hanya superadmin yang dapat menghapus layanan");
    }
    throw error;
  }
};

// Function to get a single layanan by ID
export const getLayananById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/pelayanan/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching layanan by ID:", error);
    throw error;
  }
};

// Function to create a new layanan with role validation
export const createLayanan = async (layananData) => {
  // Check if user is superadmin
  if (!isSuperAdmin()) {
    return createTemporaryError("Hanya superadmin yang dapat menambah layanan");
  }

  try {
    const response = await axios.post("http://localhost:5000/api/pelayanan", layananData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error creating layanan:", error);
    // If server returns 403 error, show permission message
    if (error.response?.status === 403) {
      return createTemporaryError("Hanya superadmin yang dapat menambah layanan");
    }
    throw error;
  }
};

// Function to update a layanan with role validation
export const updateLayanan = async (id, layananData) => {
  // Check if user is superadmin
  if (!isSuperAdmin()) {
    return createTemporaryError("Hanya superadmin yang dapat mengubah layanan");
  }

  try {
    const response = await axios.put(`http://localhost:5000/api/pelayanan/${id}`, layananData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error updating layanan:", error);
    // If server returns 403 error, show permission message
    if (error.response?.status === 403) {
      return createTemporaryError("Hanya superadmin yang dapat mengubah layanan");
    }
    throw error;
  }
};