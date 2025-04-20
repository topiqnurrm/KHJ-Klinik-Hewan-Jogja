import express from 'express';
import Pelayanan from '../models/pelayanan.js';

const router = express.Router();

// Endpoint untuk mendapatkan semua layanan
router.get('/', async (req, res) => {
  try {
    const layanan = await Pelayanan.find();
    res.json(layanan);
  } catch (error) {
    console.error("Error fetching layanan:", error);
    res.status(500).send("Server error");
  }
});

export default router;
