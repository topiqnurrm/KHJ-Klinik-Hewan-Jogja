// routes/laporanRoutes.js
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

    // 1. Ambil data kunjungan dalam range tanggal terlebih dahulu
    const kunjunganData = await Kunjungan.find({
      tanggal: {
        $gte: startDate,
        $lte: endDate
      }
    });

    console.log('Found kunjungan:', kunjunganData.length);

    if (kunjunganData.length === 0) {
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

    // 2. Ambil semua rekam medis yang terkait dengan kunjungan yang sudah difilter
    const kunjunganIds = kunjunganData.map(k => k._id);
    const rekamMedisData = await RekamMedis.find({
      id_kunjungan: { $in: kunjunganIds }
    });

    console.log('Found rekam medis:', rekamMedisData.length);

    // 3. Proses data rekap pasien
    const rekapPasien = kunjunganData.map(kunjungan => {
      const rekamMedis = rekamMedisData.find(rm => 
        rm.id_kunjungan.toString() === kunjungan._id.toString()
      );
      
      // Ambil dokter terbaru berdasarkan tanggal dari rekam medis
      let dokterNama = '';
      if (rekamMedis && rekamMedis.dokters && rekamMedis.dokters.length > 0) {
        const dokterTerbaru = rekamMedis.dokters.reduce((latest, current) => {
          const latestDate = new Date(latest.tanggal);
          const currentDate = new Date(current.tanggal);
          return currentDate > latestDate ? current : latest;
        });
        dokterNama = dokterTerbaru.nama || '';
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

      // Convert Decimal128 to number for biaya
      let biayaValue = 0;
      if (kunjungan.biaya && kunjungan.biaya.toString) {
        biayaValue = parseFloat(kunjungan.biaya.toString()) || 0;
      }

      return {
        tanggal: kunjungan.tanggal,
        nama: kunjungan.nama_hewan || '', // Changed from nama_pasien to nama_hewan
        dokter: dokterNama,
        diagnosa: rekamMedis ? (rekamMedis.diagnosa || '') : '',
        pemilik: kunjungan.nama_klein || '', // Fixed typo from nama_klien to nama_klein
        no_antri: kunjungan.no_antri || '',
        kategori: kunjungan.kategori || '',
        jenis_layanan: kunjungan.jenis_layanan || '',
        biaya: biayaValue,
        status: statusTerbaru
      };
    });

    // 4. Proses data rekap obat dari rekam medis yang sudah difilter
    const rekapObat = [];
    let totalObat = 0;

    rekamMedisData.forEach(rekamMedis => {
      if (rekamMedis.produks && rekamMedis.produks.length > 0) {
        rekamMedis.produks.forEach(produk => {
          // Filter berdasarkan tanggal produk juga harus dalam range
          const produkDate = new Date(produk.tanggal);
          if (produkDate >= startDate && produkDate <= endDate) {
            const kunjungan = kunjunganData.find(k => 
              k._id.toString() === rekamMedis.id_kunjungan.toString()
            );
            
            // Cari dokter berdasarkan tanggal yang sama dengan produk
            let dokterNama = '';
            if (rekamMedis.dokters && rekamMedis.dokters.length > 0) {
              const dokterSesuai = rekamMedis.dokters.find(dokter => {
                const dokterDate = new Date(dokter.tanggal);
                const produkDateMatch = new Date(produk.tanggal);
                // Compare with same timestamp (date and time)
                return dokterDate.getTime() === produkDateMatch.getTime();
              });
              dokterNama = dokterSesuai ? (dokterSesuai.nama || '') : '';
            }

            // Convert Decimal128 to number
            const harga = produk.harga ? parseFloat(produk.harga.toString()) || 0 : 0;
            const subtotal = produk.subtotal_obat ? parseFloat(produk.subtotal_obat.toString()) || 0 : 0;
            
            totalObat += subtotal;

            rekapObat.push({
              tanggal: produk.tanggal,
              pasien: kunjungan ? (kunjungan.nama_hewan || '') : '',
              klien: kunjungan ? (kunjungan.nama_klein || '') : '',
              dokter: dokterNama,
              obat: produk.nama || '',
              jenis: produk.jenis || '',
              kategori: produk.kategori || '',
              harga: harga,
              qty: produk.jumlah || 0,
              total: subtotal
            });
          }
        });
      }
    });

    // 5. Proses data rekap pelayanan dari rekam medis yang sudah difilter
    const rekapPelayanan = [];
    let totalPelayanan = 0;

    rekamMedisData.forEach(rekamMedis => {
      if (rekamMedis.pelayanans2 && rekamMedis.pelayanans2.length > 0) {
        rekamMedis.pelayanans2.forEach(pelayanan => {
          // Filter berdasarkan tanggal pelayanan juga harus dalam range
          const pelayananDate = new Date(pelayanan.tanggal);
          if (pelayananDate >= startDate && pelayananDate <= endDate) {
            const kunjungan = kunjunganData.find(k => 
              k._id.toString() === rekamMedis.id_kunjungan.toString()
            );
            
            // Cari dokter berdasarkan tanggal yang sama dengan pelayanan
            let dokterNama = '';
            if (rekamMedis.dokters && rekamMedis.dokters.length > 0) {
              const dokterSesuai = rekamMedis.dokters.find(dokter => {
                const dokterDate = new Date(dokter.tanggal);
                const pelayananDateMatch = new Date(pelayanan.tanggal);
                // Compare with same timestamp (date and time)
                return dokterDate.getTime() === pelayananDateMatch.getTime();
              });
              dokterNama = dokterSesuai ? (dokterSesuai.nama || '') : '';
            }

            // Convert Decimal128 to number
            const harga = pelayanan.harga ? parseFloat(pelayanan.harga.toString()) || 0 : 0;
            const subtotal = pelayanan.subtotal_pelayanan ? parseFloat(pelayanan.subtotal_pelayanan.toString()) || 0 : 0;
            
            totalPelayanan += subtotal;

            rekapPelayanan.push({
              tanggal: pelayanan.tanggal,
              pasien: kunjungan ? (kunjungan.nama_hewan || '') : '',
              klien: kunjungan ? (kunjungan.nama_klein || '') : '',
              dokter: dokterNama,
              pelayanan: pelayanan.nama || '',
              kategori: pelayanan.kategori || '',
              harga: harga,
              qty: pelayanan.jumlah || 0,
              total: subtotal
            });
          }
        });
      }
    });

    // 6. Hitung total pendapatan
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