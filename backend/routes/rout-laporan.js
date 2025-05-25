// routes/laporanRoutes.js - BAGIAN YANG DIPERBAIKI
import express from 'express';
import Kunjungan from '../models/kunjungan.js';
import RekamMedis from '../models/rekam_medis.js';

const router = express.Router();

// 📊 Ambil laporan kunjungan berdasarkan range tanggal
router.get('/kunjungan', async (req, res) => {
  try {
    const { tanggal_awal, tanggal_akhir } = req.query;
    
    if (!tanggal_awal || !tanggal_akhir) {
      return res.status(400).json({ message: 'Tanggal awal dan akhir diperlukan' });
    }

    // Convert string dates to Date objects
    const startDate = new Date(tanggal_awal);
    const endDate = new Date(tanggal_akhir);
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    console.log('Date range:', startDate, 'to', endDate);

    // 1. Ambil SEMUA data kunjungan terlebih dahulu untuk menghitung tanggal selesai
    const allKunjunganData = await Kunjungan.find({});
    
    // 2. Filter kunjungan berdasarkan range tanggal (mulai ATAU selesai dalam range)
    const filteredKunjunganData = allKunjunganData.filter(kunjungan => {
      const tanggalMulai = new Date(kunjungan.tanggal);
      
      // Hitung tanggal selesai dari updated_at atau administrasi terakhir
      let tanggalSelesai = kunjungan.tanggal; // default ke tanggal mulai
      if (kunjungan.updated_at) {
        tanggalSelesai = kunjungan.updated_at;
      } else if (kunjungan.administrasis2 && kunjungan.administrasis2.length > 0) {
        // Ambil tanggal administrasi terakhir
        const administrasiTerakhir = kunjungan.administrasis2.reduce((latest, current) => {
          const latestDate = new Date(latest.tanggal);
          const currentDate = new Date(current.tanggal);
          return currentDate > latestDate ? current : latest;
        });
        tanggalSelesai = administrasiTerakhir.tanggal;
      }
      
      const tanggalSelesaiDate = new Date(tanggalSelesai);
      
      // Kunjungan terdeteksi jika:
      // 1. Tanggal mulai dalam range, ATAU
      // 2. Tanggal selesai dalam range, ATAU  
      // 3. Range filter berada di antara tanggal mulai dan selesai
      const mulaiDalamRange = tanggalMulai >= startDate && tanggalMulai <= endDate;
      const selesaiDalamRange = tanggalSelesaiDate >= startDate && tanggalSelesaiDate <= endDate;
      const rangeDiTengah = tanggalMulai <= startDate && tanggalSelesaiDate >= endDate;
      
      return mulaiDalamRange || selesaiDalamRange || rangeDiTengah;
    });

    console.log('Found kunjungan after filtering:', filteredKunjunganData.length);

    if (filteredKunjunganData.length === 0) {
      return res.status(200).json({
        periode: { tanggal_awal, tanggal_akhir },
        rekap_pasien: [],
        rekap_obat: [],
        rekap_pelayanan: [],
        total_obat: 0,
        total_pelayanan: 0,
        total_pendapatan: 0
      });
    }

    // 3. Ambil SEMUA rekam medis yang terkait dengan kunjungan yang terfilter
    const kunjunganIds = filteredKunjunganData.map(k => k._id);
    const rekamMedisData = await RekamMedis.find({
      id_kunjungan: { $in: kunjunganIds }
    });

    console.log('Found rekam medis:', rekamMedisData.length);

    // 4. Proses data rekap pasien dengan tanggal mulai dan selesai
    const rekapPasien = filteredKunjunganData.map(kunjungan => {
      const rekamMedis = rekamMedisData.find(rm => 
        rm.id_kunjungan.toString() === kunjungan._id.toString()
      );
      
      // PERBAIKAN: Ambil SEMUA dokter unik, bukan hanya dokter terbaru
      let dokterNama = '';
      if (rekamMedis && rekamMedis.dokters && rekamMedis.dokters.length > 0) {
        // Buat Set untuk menyimpan nama dokter unik
        const dokterUnik = new Set();
        
        // Tambahkan semua nama dokter yang ada
        rekamMedis.dokters.forEach(dokter => {
          if (dokter.nama && dokter.nama.trim()) {
            dokterUnik.add(dokter.nama.trim());
          }
        });
        
        // Gabungkan semua nama dokter unik dengan koma
        dokterNama = Array.from(dokterUnik).join(', ');
        
        // Debug log untuk melihat semua dokter
        console.log(`Kunjungan ${kunjungan.nama_hewan || 'Unknown'} - Dokters found:`, 
          rekamMedis.dokters.map(d => ({ nama: d.nama, id: d.id_user, tanggal: d.tanggal }))
        );
        console.log(`Final dokter string: "${dokterNama}"`);
      }

      // Ambil status terbaru dari administrasis2
      let statusTerbaru = '';
      if (kunjungan.administrasis2 && kunjungan.administrasis2.length > 0) {
        const statusTerakhir = kunjungan.administrasis2.reduce((latest, current) => {
          const latestDate = new Date(latest.tanggal);
          const currentDate = new Date(current.tanggal);
          return currentDate > latestDate ? current : latest;
        });
        statusTerbaru = statusTerakhir.status_kunjungan || '';
      }

      // Hitung tanggal selesai dari updated_at atau administrasi terakhir
      let tanggalSelesai = kunjungan.tanggal; // default ke tanggal mulai
      if (kunjungan.updated_at) {
        tanggalSelesai = kunjungan.updated_at;
      } else if (kunjungan.administrasis2 && kunjungan.administrasis2.length > 0) {
        // Ambil tanggal administrasi terakhir
        const administrasiTerakhir = kunjungan.administrasis2.reduce((latest, current) => {
          const latestDate = new Date(latest.tanggal);
          const currentDate = new Date(current.tanggal);
          return currentDate > latestDate ? current : latest;
        });
        tanggalSelesai = administrasiTerakhir.tanggal;
      }

      // Convert Decimal128 to number for biaya
      let biayaValue = 0;
      if (kunjungan.biaya && kunjungan.biaya.toString) {
        biayaValue = parseFloat(kunjungan.biaya.toString()) || 0;
      }

      return {
        tanggal_mulai: kunjungan.tanggal,
        tanggal_selesai: tanggalSelesai,
        nama: kunjungan.nama_hewan || '',
        dokter: dokterNama, // Ini sekarang berisi semua dokter unik
        diagnosa: rekamMedis ? (rekamMedis.diagnosa || '') : '',
        pemilik: kunjungan.nama_klein || '',
        no_antri: kunjungan.no_antri || '',
        kategori: kunjungan.kategori || '',
        jenis_layanan: kunjungan.jenis_layanan || '',
        biaya: biayaValue,
        status: statusTerbaru
      };
    });

    // 5. Proses data rekap obat (SEMUA OBAT dari kunjungan yang difilter, TANPA KOLOM DOKTER)
    const rekapObat = [];
    let totalObat = 0;

    rekamMedisData.forEach(rekamMedis => {
      if (rekamMedis.produks && rekamMedis.produks.length > 0) {
        rekamMedis.produks.forEach(produk => {
          const kunjungan = filteredKunjunganData.find(k => 
            k._id.toString() === rekamMedis.id_kunjungan.toString()
          );
          
          // Convert Decimal128 to number
          const harga = produk.harga ? parseFloat(produk.harga.toString()) || 0 : 0;
          const subtotal = produk.subtotal_obat ? parseFloat(produk.subtotal_obat.toString()) || 0 : 0;
          
          totalObat += subtotal;

          rekapObat.push({
            tanggal: produk.tanggal,
            pasien: kunjungan ? (kunjungan.nama_hewan || '') : '',
            klien: kunjungan ? (kunjungan.nama_klein || '') : '',
            obat: produk.nama || '',
            jenis: produk.jenis || '',
            kategori: produk.kategori || '',
            harga: harga,
            qty: produk.jumlah || 0,
            total: subtotal
          });
        });
      }
    });

    // 6. Proses data rekap pelayanan (SEMUA PELAYANAN dari kunjungan yang difilter, TANPA KOLOM DOKTER)
    const rekapPelayanan = [];
    let totalPelayanan = 0;

    rekamMedisData.forEach(rekamMedis => {
      if (rekamMedis.pelayanans2 && rekamMedis.pelayanans2.length > 0) {
        rekamMedis.pelayanans2.forEach(pelayanan => {
          const kunjungan = filteredKunjunganData.find(k => 
            k._id.toString() === rekamMedis.id_kunjungan.toString()
          );
          
          // Convert Decimal128 to number
          const harga = pelayanan.harga ? parseFloat(pelayanan.harga.toString()) || 0 : 0;
          const subtotal = pelayanan.subtotal_pelayanan ? parseFloat(pelayanan.subtotal_pelayanan.toString()) || 0 : 0;
          
          totalPelayanan += subtotal;

          rekapPelayanan.push({
            tanggal: pelayanan.tanggal,
            pasien: kunjungan ? (kunjungan.nama_hewan || '') : '',
            klien: kunjungan ? (kunjungan.nama_klein || '') : '',
            pelayanan: pelayanan.nama || '',
            kategori: pelayanan.kategori || '',
            harga: harga,
            qty: pelayanan.jumlah || 0,
            total: subtotal
          });
        });
      }
    });

    // 7. Hitung total pendapatan
    const totalPendapatan = totalObat + totalPelayanan;

    const response = {
      periode: {
        tanggal_awal,
        tanggal_akhir
      },
      rekap_pasien: rekapPasien,
      rekap_obat: rekapObat,
      rekap_pelayanan: rekapPelayanan,
      total_obat: totalObat,
      total_pelayanan: totalPelayanan,
      total_pendapatan: totalPendapatan
    };

    console.log('Response summary:', {
      rekap_pasien_count: rekapPasien.length,
      rekap_obat_count: rekapObat.length,
      rekap_pelayanan_count: rekapPelayanan.length,
      total_obat: totalObat,
      total_pelayanan: totalPelayanan,
      total_pendapatan: totalPendapatan
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Gagal mengambil laporan kunjungan:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil laporan kunjungan',
      error: error.message 
    });
  }
});

export default router;