import axios from 'axios';

// export const getPasienByUserId = async (id_user) => {
//   try {
//     const response = await axios.get(`http://localhost:5000/api/pasien/user/${id_user}`);
//     return response.data;
//   } catch (err) {
//     console.error('Gagal mengambil data pasien:', err);
//     return [];
//   }
// };

export const getPasienByUserId = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/pasien/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data pasien:", error);
    throw error;
  }
};


export const deletePasienById = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/pasien/${id}`);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus pasien:", error);
    throw error;
  }
};
