import mongoose from 'mongoose';
import RekamMedis from '../models/rekam_medis.js';
import Kunjungan from '../models/kunjungan.js'; // Mengambil model Kunjungan
import User from '../models/user.js'; // Mengambil model User
import Pelayanan from '../models/pelayanan.js'; // Mengambil model Pelayanan
import Produk from '../models/produk.js'; // Mengambil model Produk

// Ambil ID Kunjungan, User, Pelayanan dan Produk yang valid dari database
const sampleKunjunganId1 = new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f42'); // Ganti dengan ID Kunjungan yang valid
const sampleKunjunganId2 = new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f45'); // Ganti dengan ID Kunjungan yang valid
const sampleKunjunganId3 = new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f47');
const sampleUserId1 = new mongoose.Types.ObjectId('67f0bbaac83a8ce540c7e9c4');  // Ganti dengan ID User yang valid
const sampleUserId2 = new mongoose.Types.ObjectId('67f0bbaac83a8ce540c7e9c9');  // Ganti dengan ID User yang valid
const samplePelayananId1 = new mongoose.Types.ObjectId('67f026757099fba35c613520');  // Ganti dengan ID Pelayanan yang valid
const samplePelayananId2 = new mongoose.Types.ObjectId('67f026757099fba35c613521');  // Ganti dengan ID Pelayanan yang valid
const samplePelayananId3 = new mongoose.Types.ObjectId('67f026757099fba35c613522');
const sampleProdukId1 = new mongoose.Types.ObjectId('67f026757099fba35c613525');  // Ganti dengan ID Produk yang valid
const sampleProdukId2 = new mongoose.Types.ObjectId('67f026757099fba35c613526');  
const sampleProdukId3 = new mongoose.Types.ObjectId('67f026757099fba35c613527'); 

const data = [
  // {
  //   _id: new mongoose.Types.ObjectId('67f0c1ffa8e96333aa767e66'),
  //   diagnosa: 'Cacingan',
  //   berat_badan: mongoose.Types.Decimal128.fromString('5.50'),
  //   suhu_badan: mongoose.Types.Decimal128.fromString('38.5'),
  //   pemeriksaan: 'Pemeriksaan cacingan pada hewan peliharaan',
  //   hasil: 'Pemeriksaan lanjutan, perlu cek ulang dalam 3 hari.',
  //   id_kunjungan: sampleKunjunganId1,
  //   dokters: [
  //     {
  //       id_user: sampleUserId1,
  //       hasil: 'Obat cacing diberikan, kondisinya membaik.',
  //       tanggal: new Date('2025-05-15')
  //     },
  //     {
  //       id_user: sampleUserId2,
  //       hasil: 'Pemeriksaan lanjutan, perlu cek ulang dalam 3 hari.',
  //       tanggal: new Date('2025-05-16')
  //     }
  //   ],
  //   produks: [
  //     {
  //       id_produk: sampleProdukId1,
  //       jumlah: 2,
  //       tanggal: new Date('2025-05-15')
  //     }
  //   ],
  //   pelayanans2: [
  //     {
  //       id_pelayanan: samplePelayananId1,
  //       jumlah: 1,
  //       tanggal: new Date('2025-05-15')
  //     }
  //   ]
  // },
  // {
  //   _id: new mongoose.Types.ObjectId('67f0c1ffa8e96333aa767e6b'),
  //   diagnosa: 'Diare',
  //   berat_badan: mongoose.Types.Decimal128.fromString('7.00'),
  //   suhu_badan: mongoose.Types.Decimal128.fromString('37.8'),
  //   pemeriksaan: 'Pemeriksaan diare pada hewan peliharaan',
  //   hasil: 'Diberikan obat diare dan disarankan makan makanan lembek.',
  //   id_kunjungan: sampleKunjunganId2,
  //   dokters: [
  //     {
  //       id_user: sampleUserId1,
  //       hasil: 'Diberikan obat diare dan disarankan makan makanan lembek.',
  //       tanggal: new Date('2025-05-16')
  //     }
  //   ],
  //   produks: [
  //     {
  //       id_produk: sampleProdukId1,
  //       jumlah: 3,
  //       tanggal: new Date('2025-05-16')
  //     }
  //   ],
  //   pelayanans2: [
  //     {
  //       id_pelayanan: samplePelayananId2,
  //       jumlah: 1,
  //       tanggal: new Date('2025-05-16')
  //     }
  //   ]
  // }
];

async function seed() {
  try {
    // Menghapus semua data RekamMedis yang ada di database
    await RekamMedis.deleteMany();
    // Menambahkan data RekamMedis yang baru
    await RekamMedis.insertMany(data);
    console.log('Seeded: rekam_medis');
  } catch (err) {
    console.error('Error seeding rekam_medis:', err);
  }
}

export default seed;
