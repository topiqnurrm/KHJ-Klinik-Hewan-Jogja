// src/api/user.js
import axios from 'axios';

export const getKlienUser = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/users/klien');
    return response.data;
  } catch (error) {
    console.error('Gagal fetch data klien:', error);
    return null;
  }
};
