import axios from 'axios';

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
