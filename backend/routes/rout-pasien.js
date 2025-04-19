// routes/pasien.js
import express from 'express';
import Pasien from '../models/pasien.js';

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    try {
      const pasien = await Pasien.find({ id_user: req.params.userId }); // ✅ Sesuai field di DB
      res.json(pasien);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data pasien' });
    }
  });
  
  

export default router;