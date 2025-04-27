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
