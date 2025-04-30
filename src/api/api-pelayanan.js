import axios from 'axios';

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

// Function to delete a layanan
export const deleteLayanan = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/pelayanan/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting layanan:", error);
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

// Function to create a new layanan
export const createLayanan = async (layananData) => {
  try {
    const response = await axios.post("http://localhost:5000/api/pelayanan", layananData);
    return response.data;
  } catch (error) {
    console.error("Error creating layanan:", error);
    throw error;
  }
};

// Function to update a layanan
export const updateLayanan = async (id, layananData) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/pelayanan/${id}`, layananData);
    return response.data;
  } catch (error) {
    console.error("Error updating layanan:", error);
    throw error;
  }
};