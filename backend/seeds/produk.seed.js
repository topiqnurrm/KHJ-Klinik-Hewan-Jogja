import mongoose from 'mongoose';
import Produk from '../models/produk.js';

// Data produk yang akan dimasukkan ke dalam koleksi produk
const data = [
  {
    _id: new mongoose.Types.ObjectId('67f026757099fba35c613525'),
    nama: 'Obat Cacing',
    kategori: 'antibiotik', // Anda bisa sesuaikan kategori sesuai kebutuhan
    jenis: 'tablet', // Anda bisa sesuaikan jenis sesuai kebutuhan
    harga: mongoose.Types.Decimal128.fromString('25000.00'),
    stok: mongoose.Types.Decimal128.fromString('100.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  {
    _id: new mongoose.Types.ObjectId('67f026757099fba35c613526'),
    nama: 'Vaksin Rabies',
    kategori: 'vaksin_hewan_kesayangan',
    jenis: 'vial',
    harga: mongoose.Types.Decimal128.fromString('150000.00'),
    stok: mongoose.Types.Decimal128.fromString('50.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  {
    _id: new mongoose.Types.ObjectId('67f026757099fba35c613527'),
    nama: 'Vitamin C',
    kategori: 'suplemen',
    jenis: 'tablet',
    harga: mongoose.Types.Decimal128.fromString('30000.00'),
    stok: mongoose.Types.Decimal128.fromString('200.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  // A. Antibiotik 17
  { nama: 'Inj. Amoxicillin', kategori: 'antibiotik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('25000.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Colibact/ Kotrimoksazol', kategori: 'antibiotik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('27000.00'), stok: mongoose.Types.Decimal128.fromString('90.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Enrofloxacin', kategori: 'antibiotik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('30000.00'), stok: mongoose.Types.Decimal128.fromString('80.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Gentamicin', kategori: 'antibiotik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('26000.00'), stok: mongoose.Types.Decimal128.fromString('75.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Metronidazol', kategori: 'antibiotik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('25000.00'), stok: mongoose.Types.Decimal128.fromString('70.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Penisilin streptomisin', kategori: 'antibiotik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('27000.00'), stok: mongoose.Types.Decimal128.fromString('60.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Amoxicillin', kategori: 'antibiotik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1500.00'), stok: mongoose.Types.Decimal128.fromString('200.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Amoxicillin Klavulanat', kategori: 'antibiotik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1800.00'), stok: mongoose.Types.Decimal128.fromString('190.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Ko-amoksisilin', kategori: 'antibiotik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1700.00'), stok: mongoose.Types.Decimal128.fromString('180.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Kotrimoksazol', kategori: 'antibiotik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1500.00'), stok: mongoose.Types.Decimal128.fromString('175.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Metronidazol', kategori: 'antibiotik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1600.00'), stok: mongoose.Types.Decimal128.fromString('170.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Caps Doxycycline', kategori: 'antibiotik', jenis: 'kapsul', harga: mongoose.Types.Decimal128.fromString('2000.00'), stok: mongoose.Types.Decimal128.fromString('160.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Kap Oksitetrasiklin', kategori: 'antibiotik', jenis: 'kapsul', harga: mongoose.Types.Decimal128.fromString('1800.00'), stok: mongoose.Types.Decimal128.fromString('150.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Kaplet SulfaTrimeth/ Fasiprim', kategori: 'antibiotik', jenis: 'kaplet', harga: mongoose.Types.Decimal128.fromString('1600.00'), stok: mongoose.Types.Decimal128.fromString('145.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Sir Enrofloxacin', kategori: 'antibiotik', jenis: 'botol', harga: mongoose.Types.Decimal128.fromString('30000.00'), stok: mongoose.Types.Decimal128.fromString('40.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Drp Gentamicin/ Genoint', kategori: 'antibiotik', jenis: 'botol', harga: mongoose.Types.Decimal128.fromString('28000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Drp Kloramfenikol/ Erlamyecetin', kategori: 'antibiotik', jenis: 'botol', harga: mongoose.Types.Decimal128.fromString('29000.00'), stok: mongoose.Types.Decimal128.fromString('45.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },

  // B. Antiparasit/Antijamur 5
  { nama: 'Inj. Ivomec/ Ivermectin', kategori: 'antijamur', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('32000.00'), stok: mongoose.Types.Decimal128.fromString('60.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Drp. Ivo', kategori: 'antijamur', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('18000.00'), stok: mongoose.Types.Decimal128.fromString('40.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Drp Selamektin', kategori: 'antijamur', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('22000.00'), stok: mongoose.Types.Decimal128.fromString('35.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Pyrantel pamoat', kategori: 'antijamur', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1500.00'), stok: mongoose.Types.Decimal128.fromString('70.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Griseofulvin', kategori: 'antijamur', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1700.00'), stok: mongoose.Types.Decimal128.fromString('60.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },

  // C. Antiradang/Antihistamin 6
  { nama: 'Inj Deksametason', kategori: 'antiradang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('24000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj Diphenhidramin/ Vetadryl', kategori: 'antiradang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('25000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj Dipiron/ Sulfidoin', kategori: 'antiradang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('23000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj Pirazolon', kategori: 'antiradang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('22000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Deksametason', kategori: 'antiradang', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1000.00'), stok: mongoose.Types.Decimal128.fromString('90.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Tab Cyproheptadine/ Graperide', kategori: 'antiradang', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1200.00'), stok: mongoose.Types.Decimal128.fromString('80.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },

  // D. Penenang 4
  { nama: 'Inj. Acepromazin/ Castran', kategori: 'penenang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('25000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Atropin', kategori: 'penenang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('26000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Ketamin', kategori: 'penenang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('30000.00'), stok: mongoose.Types.Decimal128.fromString('25.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },
  { nama: 'Inj. Lidokain', kategori: 'penenang', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('20000.00'), stok: mongoose.Types.Decimal128.fromString('25.00'), id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') },

  // E. Suplemen 20
  { nama: 'Inj. Vitamin B12', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('15000.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. ADE', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('16000.00'), stok: mongoose.Types.Decimal128.fromString('90.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. Vitamin B kompleks', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('17000.00'), stok: mongoose.Types.Decimal128.fromString('80.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. Vitamin B1', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('14000.00'), stok: mongoose.Types.Decimal128.fromString('85.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. Biodin/ Biosan/ ATP', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('18000.00'), stok: mongoose.Types.Decimal128.fromString('70.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. Hematodin', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('16000.00'), stok: mongoose.Types.Decimal128.fromString('75.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. Vitamin K', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('15000.00'), stok: mongoose.Types.Decimal128.fromString('60.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inj. Calcidex (Kalsium)', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('17000.00'), stok: mongoose.Types.Decimal128.fromString('65.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Vitamin B kompleks/ Livron', kategori: 'suplemen', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1300.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Neurodex', kategori: 'suplemen', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1500.00'), stok: mongoose.Types.Decimal128.fromString('95.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Vitamin B1', kategori: 'suplemen', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1200.00'), stok: mongoose.Types.Decimal128.fromString('90.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Vitamin B6', kategori: 'suplemen', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1200.00'), stok: mongoose.Types.Decimal128.fromString('85.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Kalsium', kategori: 'suplemen', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1400.00'), stok: mongoose.Types.Decimal128.fromString('80.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Lecozinc/ Zinc/ Seng', kategori: 'suplemen', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1300.00'), stok: mongoose.Types.Decimal128.fromString('75.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Sir Anabion', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('18000.00'), stok: mongoose.Types.Decimal128.fromString('70.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Sir Sakatonik', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('19000.00'), stok: mongoose.Types.Decimal128.fromString('70.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Sir Isprinol/Methisoprinol', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('20000.00'), stok: mongoose.Types.Decimal128.fromString('60.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Sir. Hufagrip', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('16000.00'), stok: mongoose.Types.Decimal128.fromString('60.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inf NaCl', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('10000.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Inf Ringer Lactat', kategori: 'suplemen', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('11000.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId() },

  // F. Antisimtomatik 5
  { nama: 'Tab Enterostop/ atapulgit', kategori: 'antisimtomatik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1000.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Karbon', kategori: 'antisimtomatik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('1000.00'), stok: mongoose.Types.Decimal128.fromString('90.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Kap Nephrolit', kategori: 'antisimtomatik', jenis: 'kapsul', harga: mongoose.Types.Decimal128.fromString('1500.00'), stok: mongoose.Types.Decimal128.fromString('80.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Glyserin', kategori: 'antisimtomatik', jenis: 'mililiter', harga: mongoose.Types.Decimal128.fromString('9000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tab Ondansentron', kategori: 'antisimtomatik', jenis: 'tablet', harga: mongoose.Types.Decimal128.fromString('2000.00'), stok: mongoose.Types.Decimal128.fromString('70.00'), id_user: new mongoose.Types.ObjectId() },

  // G. Topikal / Tetes 5
  { nama: 'Slp Bioplacenton', kategori: 'tetes', jenis: 'tube', harga: mongoose.Types.Decimal128.fromString('11000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Slp Genoint/ Gentamisin', kategori: 'tetes', jenis: 'tube', harga: mongoose.Types.Decimal128.fromString('12000.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Slp New Astar', kategori: 'tetes', jenis: 'tube', harga: mongoose.Types.Decimal128.fromString('11500.00'), stok: mongoose.Types.Decimal128.fromString('50.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Salf', kategori: 'tetes', jenis: 'tube', harga: mongoose.Types.Decimal128.fromString('10000.00'), stok: mongoose.Types.Decimal128.fromString('40.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Gusanex', kategori: 'tetes', jenis: 'tube', harga: mongoose.Types.Decimal128.fromString('10500.00'), stok: mongoose.Types.Decimal128.fromString('35.00'), id_user: new mongoose.Types.ObjectId() },

  // H. Vaksin Hewan Kesayangan 4
  { nama: 'Rabisin', kategori: 'vaksin_hewan_kesayangan', jenis: 'vial', harga: mongoose.Types.Decimal128.fromString('50000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Vaksin F3', kategori: 'vaksin_hewan_kesayangan', jenis: 'vial', harga: mongoose.Types.Decimal128.fromString('55000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Vaksin F4', kategori: 'vaksin_hewan_kesayangan', jenis: 'vial', harga: mongoose.Types.Decimal128.fromString('60000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Tricat', kategori: 'vaksin_hewan_kesayangan', jenis: 'vial', harga: mongoose.Types.Decimal128.fromString('65000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId() },

  // I. Vaksin Unggas 1
  { nama: 'Vaksin ND', kategori: 'vaksin_unggas', jenis: 'dosis', harga: mongoose.Types.Decimal128.fromString('2000.00'), stok: mongoose.Types.Decimal128.fromString('100.00'), id_user: new mongoose.Types.ObjectId() },

  // J. Tambahan 3
  { nama: 'Kateter', kategori: 'tambahan', jenis: 'buah', harga: mongoose.Types.Decimal128.fromString('15000.00'), stok: mongoose.Types.Decimal128.fromString('20.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'Benang Silk', kategori: 'tambahan', jenis: 'buah', harga: mongoose.Types.Decimal128.fromString('10000.00'), stok: mongoose.Types.Decimal128.fromString('30.00'), id_user: new mongoose.Types.ObjectId() },
  { nama: 'USG', kategori: 'tambahan', jenis: 'kali', harga: mongoose.Types.Decimal128.fromString('100000.00'), stok: mongoose.Types.Decimal128.fromString('10.00'), id_user: new mongoose.Types.ObjectId() }
];

async function seed() {
  try {
    // Menghapus data lama di koleksi 'produk'
    await Produk.deleteMany();
    console.log('Old data deleted');

    // Menambahkan data produk baru
    await Produk.insertMany(data);
    console.log('Seeded: produk');
  } catch (err) {
    console.error('Error seeding produk:', err);
  }
}

export default seed;