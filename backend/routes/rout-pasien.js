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
  

  router.post('/', async (req, res) => {
    try {
      const pasien = new Pasien(req.body);
      await pasien.save();
      res.status(201).json(pasien);
    } catch (err) {
      console.error("Error saat menambahkan pasien:", err);
      res.status(400).json({ message: err.message || "Gagal menambahkan pasien" });
    }
});
  
  

export default router;