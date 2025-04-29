import axios from 'axios';

export const getAllUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/users');
    return response.data;
  } catch (error) {
    console.error('Gagal fetch data users:', error);
    return [];
  }
};

export const getKlienUser = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/users/klien');
    return response.data;
  } catch (error) {
    console.error('Gagal fetch data klien:', error);
    return [];
  }
};

export const getUserById = async (_id) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Gagal fetch user by ID:', error);
    return null;
  }
};

export const deleteUser = async (_id) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/users/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Gagal hapus user:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/users', userData);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat user baru:', error);
    throw error;
  }
};

export const updateUser = async (_id, userData) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/users/${_id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Gagal update user:', error);
    throw error;
  }
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await axios.post('http://localhost:5000/api/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.error('Upload gagal:', err);
    return null;
  }
};