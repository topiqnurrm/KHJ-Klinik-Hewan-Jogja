import express from 'express';
import RetribusiPembayaran from '../models/retribusi_pembayaran.js';

const router = express.Router();

// 🔍 Ambil semua data retribusi pembayaran (lengkap)
router.get('/all', async (req, res) => {
  try {
    const data = await RetribusiPembayaran.find()
      .populate({
        path: 'id_kunjungan',
        populate: {
          path: 'id_pasien',
          select: 'nama jenis kategori jenis_kelamin ras id_user'
        },
        select: 'id_pasien pilih_tanggal'
      })
      .populate('id_user', 'nama email') // sesuaikan jika kamu ingin field lain
      .sort({ createdAt: -1 })
      .lean(); // Optional: lebih cepat dan ringan

    // Format Decimal128 jadi string agar lebih aman dibaca front-end
    const formattedData = data.map(entry => ({
      ...entry,
      subtotal_obat: entry.subtotal_obat?.toString(),
      total_obat: entry.total_obat?.toString(),
      subtotal_pelayanan: entry.subtotal_pelayanan?.toString(),
      total_pelayanan: entry.total_pelayanan?.toString(),
      grand_total: entry.grand_total?.toString(),
      kembali: entry.kembali?.toString()
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Gagal mengambil data retribusi:', error);
    res.status(500).json({ message: 'Gagal mengambil data retribusi pembayaran' });
  }
});

export default router;
