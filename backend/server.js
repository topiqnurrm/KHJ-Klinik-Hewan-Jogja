const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user'); // pastikan path-nya sesuai

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Koneksi ke MongoDB
// mongoose.connect('mongodb://localhost:27017/klinik_hewan')

// mongoose.connect('mongodb://127.0.0.1:27017/klinik_hewan', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
mongoose.connect('mongodb://127.0.0.1:27017/klinik_hewan')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Route test
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Route ambil data klien
app.get('/api/users/klien', async (req, res) => {
  try {
    const user = await User.findOne({ aktor: 'klien' });
    if (!user) {
      return res.status(404).json({ message: 'User klien tidak ditemukan' });
    }
    res.json(user);
  } catch (error) {
    console.error('Terjadi error saat mengambil data user klien:', error);
    res.status(500).json({ message: error.message, detail: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
