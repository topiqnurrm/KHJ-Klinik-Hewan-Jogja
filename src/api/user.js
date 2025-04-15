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

export const getUserById = async (_id) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Gagal fetch user by ID:', error);
    return null;
  }
};
