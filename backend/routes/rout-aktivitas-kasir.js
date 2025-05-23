import express from 'express';
import RetribusiPembayaran from '../models/retribusi_pembayaran.js';
import Kunjungan from '../models/kunjungan.js';
import Booking from '../models/booking.js';
import User from '../models/user.js';
import Pasien from '../models/pasien.js';
import RekamMedis from '../models/rekam_medis.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Mendapatkan semua data pembayaran untuk kasir
router.get('/all', async (req, res) => {
  try {
    // Mengambil data dari RetribusiPembayaran sebagai sumber utama
    const retribusiData = await RetribusiPembayaran.find()
      .sort({ tanggal: -1 }) // Diurutkan berdasarkan tanggal terbaru
      .populate({
        path: 'id_kunjungan',
        select: 'tanggal no_antri nama_klein nama_hewan id_booking administrasis2 jenis jenis_kelamin ras umur_hewan kategori jenis_layanan',
        populate: {
          path: 'id_booking',
          select: 'nama id_pasien administrasis1 jenis_layanan',
          populate: [
            {
              path: 'id_pasien',
              select: 'nama jenis jenis_kelamin ras umur kategori'
            },
            {
              path: 'administrasis1.id_user',
              select: 'nama'
            }
          ]
        }
      })
      .populate({
        path: 'id_user',
        select: 'nama'
      });

    // Memproses data untuk format yang sesuai dengan kebutuhan tabel
    const formattedData = await Promise.all(retribusiData.map(async (item) => {
      const kunjungan = item.id_kunjungan;
      let namaKlien = '';
      let namaHewan = '';
      let jenisHewan = '';
      let jenisKelamin = '';
      let ras = '';
      let umurHewan = '';
      let kategori = '';
      let jenisLayanan = '';

      if (kunjungan) {
        if (kunjungan.id_booking) {
          // Jika ada id_booking, ambil data dari booking dan user
          const booking = kunjungan.id_booking;
          namaHewan = booking.nama || '';
          jenisLayanan = booking.jenis_layanan || '';

          // Cek administrasis1 untuk mendapatkan id_user terbaru
          if (booking.administrasis1 && booking.administrasis1.length > 0) {
            // Ambil entri terbaru dari administrasis1
            const latestAdministrasi = booking.administrasis1
            //   .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];
              .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))[0];
            
            if (latestAdministrasi.id_user) {
              namaKlien = latestAdministrasi.id_user.nama || '';
            }
          }

          // Ambil data dari pasien jika id_pasien ada
          if (booking.id_pasien) {
            jenisHewan = booking.id_pasien.jenis || '';
            jenisKelamin = booking.id_pasien.jenis_kelamin || '-';
            ras = booking.id_pasien.ras || '-';
            umurHewan = booking.id_pasien.umur || '-';
            kategori = booking.id_pasien.kategori || '';
          }
        } else {
          // Jika tidak ada id_booking, gunakan data langsung dari kunjungan
          namaKlien = kunjungan.nama_klein || '';
          namaHewan = kunjungan.nama_hewan || '';
          jenisHewan = kunjungan.jenis || '';
          jenisKelamin = kunjungan.jenis_kelamin || '-';
          ras = kunjungan.ras || '-';
          umurHewan = kunjungan.umur_hewan || '-';
          kategori = kunjungan.kategori || '';
          jenisLayanan = kunjungan.jenis_layanan || '';
        }
      }

      // Format tanggal dengan jam
      const tanggalSelesai = item.tanggal ? 
        new Date(item.tanggal).toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

      // Cek apakah namaHewan sudah mengandung jenisHewan dalam tanda kurung
      let displayNamaHewan = namaHewan;
      if (jenisHewan && !namaHewan.toLowerCase().includes(`(${jenisHewan.toLowerCase()})`)) {
        displayNamaHewan = `${namaHewan}${jenisHewan ? ` (${jenisHewan})` : ''}`;
      }

      return {
        _id: item._id,
        tanggal_selesai: tanggalSelesai,
        tanggal_raw: item.tanggal, // Untuk keperluan sorting
        nama_klien: namaKlien,
        nama_hewan: displayNamaHewan,
        nomor_antri: kunjungan ? kunjungan.no_antri : '',
        total_tagihan: item.grand_total.toString(),
        metode_bayar: item.metode_bayar || '',
        status_retribusi: item.status_retribusi,
        id_kunjungan: item.id_kunjungan ? item.id_kunjungan._id : null,
        jenis_layanan: jenisLayanan,
        jenis_kelamin: jenisKelamin,
        ras: ras,
        umur_hewan: umurHewan,
        kategori: kategori
      };
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Gagal mengambil data kasir:', error);
    res.status(500).json({ message: 'Gagal mengambil data pembayaran', error: error.message });
  }
});

//update nama jenis hewan , nama klien dll
// Endpoint untuk mengupdate status pembayaran dan memproses pembayaran
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status_retribusi, 
      metode_bayar, 
      jumlah_pembayaran, 
      kembali, 
      update_booking, 
      booking_data,
      // New parameters
      update_kunjungan,
      kunjungan_data
    } = req.body;
    
    // Validasi input
    if (!metode_bayar) {
      return res.status(400).json({ message: 'Metode pembayaran harus diisi' });
    }
    
    // Pastikan pembayaran sesuai dengan total tagihan
    const retribusi = await RetribusiPembayaran.findById(id);
    if (!retribusi) {
      return res.status(404).json({ message: 'Data pembayaran tidak ditemukan' });
    }
    
    const grandTotal = parseFloat(retribusi.grand_total.toString());
    const pembayaran = parseFloat(jumlah_pembayaran);
    
    if (pembayaran < grandTotal) {
      return res.status(400).json({ message: 'Jumlah pembayaran tidak cukup' });
    }
    
    // Check if rekam_medis should be updated
    if (req.body.update_rekam_medis && req.body.rekam_medis_data) {
      const rekamMedisData = req.body.rekam_medis_data;
      
      // Find the corresponding rekam_medis record
      const rekamMedis = await RekamMedis.findOne({ id_kunjungan: retribusi.id_kunjungan });
      
      if (rekamMedis) {
        // REVISI: Menangani flag add_doctor_status untuk menambahkan status baru
        if (rekamMedisData.add_doctor_status) {
          // Buat objek baru untuk status dokter yang akan ditambahkan
          const newDoctorStatus = {
            status: rekamMedisData.doctor_updates.status,
            hasil: rekamMedisData.doctor_updates.hasil,
            id_user: rekamMedisData.doctor_updates.id_user,
            tanggal: rekamMedisData.doctor_updates.tanggal || new Date()
          };
          
          // Tambahkan status baru ke array dokters
          // REVISI: Tambahkan pengecekan apakah dokters sudah ada
          if (!rekamMedis.dokters) {
            rekamMedis.dokters = [];
          }
          
          rekamMedis.dokters.push(newDoctorStatus);
          await rekamMedis.save();
          
          // Tambahkan juga ke array statuses jika diperlukan
          if (!rekamMedis.statuses) {
            rekamMedis.statuses = [];
          }
          
          rekamMedis.statuses.push(newDoctorStatus);
          await rekamMedis.save();
        }
        // Tetap sertakan logika lama untuk backward compatibility
        else if (rekamMedisData.update_all_doctors && rekamMedis.dokters && rekamMedis.dokters.length > 0) {
          // Update all doctors' status and hasil
          rekamMedis.dokters = rekamMedis.dokters.map(dokter => {
            return {
              ...dokter.toObject(),
              status: rekamMedisData.doctor_updates.status || dokter.status,
              hasil: rekamMedisData.doctor_updates.hasil || dokter.hasil
            };
          });
          
          // Save the updated rekam_medis document
          await rekamMedis.save();
        } else if (rekamMedisData.doctor_id) {
          // Update specific doctor if ID is provided
          rekamMedis.dokters = rekamMedis.dokters.map(dokter => {
            if (dokter._id.toString() === rekamMedisData.doctor_id) {
              return {
                ...dokter.toObject(),
                status: rekamMedisData.doctor_updates.status || dokter.status,
                hasil: rekamMedisData.doctor_updates.hasil || dokter.hasil
              };
            }
            return dokter;
          });
          
          // Save the updated rekam_medis document
          await rekamMedis.save();
        }
      }
    }

    // Update data retribusi pembayaran
    const updatedPembayaran = await RetribusiPembayaran.findByIdAndUpdate(
      id,
      { 
        status_retribusi, 
        metode_bayar,
        jumlah_pembayaran: jumlah_pembayaran.toString(),
        kembali: kembali.toString() 
      },
      { new: true }
    );
    
    // Dapatkan informasi lengkap tentang kunjungan
    const kunjungan = retribusi.id_kunjungan ? 
                      await Kunjungan.findById(retribusi.id_kunjungan).populate({
                        path: 'id_booking',
                        populate: {
                          path: 'id_pasien'
                        }
                      }) : null;
                  
    if (kunjungan) {
      // Persiapkan data untuk update
      const kunjunganUpdateData = { 
        'administrasis2.$[elem].status_kunjungan': 'selesai'
      };
      
      // Ambil data dari booking dan pasien jika tersedia
      if (kunjungan.id_booking) {
        const booking = kunjungan.id_booking;
        const pasien = booking.id_pasien;
        
        // Perbarui data kunjungan dengan data dari booking/pasien jika belum ada
        if (!kunjungan.nama_klein || kunjungan.nama_klein === '') {
          // Cari data pemilik dari administrasis1 yang terbaru
          if (booking.administrasis1 && booking.administrasis1.length > 0) {
            const latestAdministrasi = booking.administrasis1
              .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))[0];
            
            if (latestAdministrasi.id_user) {
              const user = await User.findById(latestAdministrasi.id_user);
              if (user) {
                kunjunganUpdateData.nama_klein = user.nama;
              }
            }
          }
        }
        
        // Update nama hewan jika kosong
        if (!kunjungan.nama_hewan || kunjungan.nama_hewan === '') {
          kunjunganUpdateData.nama_hewan = booking.nama || '';
        }
        
        // Update jenis layanan jika kosong
        if (!kunjungan.jenis_layanan || kunjungan.jenis_layanan === '') {
          kunjunganUpdateData.jenis_layanan = booking.jenis_layanan || '';
        }
        
        // Update data dari model pasien jika ada
        if (pasien) {
          if (!kunjungan.jenis || kunjungan.jenis === '') {
            kunjunganUpdateData.jenis = pasien.jenis || '';
          }
          
          if (!kunjungan.jenis_kelamin || kunjungan.jenis_kelamin === '-') {
            kunjunganUpdateData.jenis_kelamin = pasien.jenis_kelamin || '-';
          }
          
          if (!kunjungan.ras || kunjungan.ras === '-') {
            kunjunganUpdateData.ras = pasien.ras || '-';
          }
          
          if (!kunjungan.umur_hewan || kunjungan.umur_hewan === '-') {
            kunjunganUpdateData.umur_hewan = pasien.umur || '-';
          }
          
          if (!kunjungan.kategori || kunjungan.kategori === '') {
            kunjunganUpdateData.kategori = pasien.kategori || '';
          }
        }
        
        // Update status booking jika diminta
        if (update_booking) {
          await Booking.findByIdAndUpdate(
            booking._id,
            { status_booking: 'mengambil obat' },
            { new: true }
          );
        }

        // Add this section to handle the new administrasis2 update
        if (update_kunjungan && kunjungan_data) {
          // Push new entry to administrasis2 array
          await Kunjungan.findByIdAndUpdate(
            kunjungan._id,
            { 
              $push: { 
                administrasis2: {
                  id_user: kunjungan_data.id_user,
                  catatan: kunjungan_data.catatan,
                  status_kunjungan: kunjungan_data.status_kunjungan,
                  tanggal: new Date()
                } 
              } 
            },
            { new: true }
          );
        }
      }
      
      // Update data kunjungan
      await Kunjungan.findByIdAndUpdate(
        kunjungan._id,
        kunjunganUpdateData,
        { 
          arrayFilters: [{ 'elem.status_kunjungan': 'menunggu pembayaran' }],
          new: true 
        }
      );
    }
    
    res.status(200).json({
      message: 'Pembayaran berhasil diproses',
      pembayaran: updatedPembayaran
    });
  } catch (error) {
    console.error('Gagal memproses pembayaran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses pembayaran', error: error.message });
  }
});

// Endpoint untuk mendapatkan detail pembayaran berdasarkan ID
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ambil data retribusi pembayaran
    const pembayaranDetail = await RetribusiPembayaran.findById(id)
      .populate({
        path: 'id_kunjungan',
        select: 'tanggal no_antri nama_klein nama_hewan id_booking jenis jenis_kelamin ras umur_hewan kategori jenis_layanan',
        populate: {
          path: 'id_booking',
          select: 'nama id_pasien jenis_layanan',
          populate: {
            path: 'id_pasien',
            select: 'nama jenis jenis_kelamin ras umur kategori'
          }
        }
      });
    
    if (!pembayaranDetail) {
      return res.status(404).json({ message: 'Detail pembayaran tidak ditemukan' });
    }
    
    // FIXED: Enhanced rekamMedis query with better population of dokters data
    const rekamMedis = await RekamMedis.findOne({ id_kunjungan: pembayaranDetail.id_kunjungan })
      .populate({
        path: 'dokters.id_user',
        select: 'nama user_id aktor'
      });
    
    // Create a response object that will be easier to work with
    const responseData = {
      ...pembayaranDetail.toObject(),
      rekam_medis: rekamMedis ? rekamMedis.toObject() : null
    };
    
    // FIXED: Ensure jenis_layanan is properly included from kunjungan if available
    if (pembayaranDetail.id_kunjungan && pembayaranDetail.id_kunjungan.jenis_layanan) {
      responseData.jenis_layanan = pembayaranDetail.id_kunjungan.jenis_layanan;
    } else if (pembayaranDetail.id_kunjungan && pembayaranDetail.id_kunjungan.id_booking && 
               pembayaranDetail.id_kunjungan.id_booking.jenis_layanan) {
      responseData.jenis_layanan = pembayaranDetail.id_kunjungan.id_booking.jenis_layanan;
    }
    
    // IMPROVED: Better handling of dokters data and ensuring names are always available
    if (rekamMedis && rekamMedis.dokters && Array.isArray(rekamMedis.dokters)) {
      // Log what we're starting with to help troubleshoot
      console.log("Raw doctors data:", JSON.stringify(rekamMedis.dokters.map(d => ({
        nama: d.nama,
        id_user: d.id_user
      }))));
      
      // Process each doctor to ensure name availability
      responseData.rekam_medis.dokters = rekamMedis.dokters.map(dokter => {
        const dokterObj = dokter.toObject ? dokter.toObject() : dokter;
        
        // Make sure we have some form of name for each doctor
        if (!dokterObj.nama || dokterObj.nama === '') {
          // If nama is empty, try to get it from id_user
          if (dokterObj.id_user && dokterObj.id_user.nama) {
            dokterObj.nama = dokterObj.id_user.nama;
          } else {
            // Fallback name if nothing is available
            dokterObj.nama = 'Dokter';
          }
        }
        
        // Ensure id_user exists and has the needed properties
        if (dokterObj.id_user) {
          // Keep existing id_user properties and ensure nama exists
          dokterObj.id_user = {
            ...dokterObj.id_user,
            nama: dokterObj.id_user.nama || dokterObj.nama || 'Dokter',
            aktor: dokterObj.id_user.aktor || 'dokter'
          };
        } else {
          // Create a minimal id_user if it doesn't exist
          dokterObj.id_user = {
            nama: dokterObj.nama || 'Dokter',
            aktor: 'dokter'
          };
        }
        
        return dokterObj;
      });
      
      // Additional logging to help troubleshoot
      console.log("Processed doctors data:", 
        responseData.rekam_medis.dokters.map(d => ({
          nama: d.nama,
          id_user_nama: d.id_user ? d.id_user.nama : null
        }))
      );
    } else {
      console.log("No doctors data found or invalid structure");
    }
    
    // FIXED: Handle Decimal128 values for berat_badan and suhu_badan
    if (rekamMedis && rekamMedis.dokters) {
      responseData.rekam_medis.dokters = responseData.rekam_medis.dokters.map(dokter => {
        const result = { ...dokter };
        
        // Convert Decimal128 berat_badan to plain number if needed
        if (dokter.berat_badan) {
          if (dokter.berat_badan.$numberDecimal) {
            result.berat_badan = parseFloat(dokter.berat_badan.$numberDecimal);
          }
        }
        
        // Convert Decimal128 suhu_badan to plain number if needed
        if (dokter.suhu_badan) {
          if (dokter.suhu_badan.$numberDecimal) {
            result.suhu_badan = parseFloat(dokter.suhu_badan.$numberDecimal);
          }
        }
        
        return result;
      });
    }
    
    // Also handle the root-level berat_badan and suhu_badan if they exist
    if (responseData.rekam_medis) {
      if (responseData.rekam_medis.berat_badan && responseData.rekam_medis.berat_badan.$numberDecimal) {
        responseData.rekam_medis.berat_badan = parseFloat(responseData.rekam_medis.berat_badan.$numberDecimal);
      }
      
      if (responseData.rekam_medis.suhu_badan && responseData.rekam_medis.suhu_badan.$numberDecimal) {
        responseData.rekam_medis.suhu_badan = parseFloat(responseData.rekam_medis.suhu_badan.$numberDecimal);
      }
    }
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Gagal mengambil detail pembayaran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil detail pembayaran', error: error.message });
  }
});

// Endpoint untuk mencetak retribusi pembayaran
router.get('/print-retribusi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ambil data lengkap untuk dicetak
    const retribusi = await RetribusiPembayaran.findById(id)
      .populate({
        path: 'id_kunjungan',
        populate: {
          path: 'id_booking',
          populate: {
            path: 'id_pasien'
          }
        }
      });
    
    if (!retribusi) {
      return res.status(404).json({ message: 'Data pembayaran tidak ditemukan' });
    }
    
    const rekamMedis = await RekamMedis.findOne({ id_kunjungan: retribusi.id_kunjungan._id })
      .populate('dokters.id_user');
    
    // TODO: Implementasi cetak PDF
    // Untuk tujuan pengembangan, kirim saja data JSON dulu
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=retribusi.pdf');
    
    // Placeholder untuk pembuatan PDF - implementasi sesungguhnya perlu library PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const bytes = await pdfDoc.save();
    
    res.send(Buffer.from(bytes));
  } catch (error) {
    console.error('Gagal mencetak retribusi pembayaran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mencetak retribusi' });
  }
});

// Endpoint untuk mencetak rekam medis
router.get('/print-rekam-medis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ambil data retribusi untuk mendapatkan id_kunjungan
    const retribusi = await RetribusiPembayaran.findById(id);
    
    if (!retribusi) {
      return res.status(404).json({ message: 'Data pembayaran tidak ditemukan' });
    }
    
    // Ambil rekam medis untuk dicetak
    const rekamMedis = await RekamMedis.findOne({ id_kunjungan: retribusi.id_kunjungan })
      .populate('dokters.id_user')
      .populate('produks.id_produk')
      .populate('pelayanans2.id_pelayanan');
    
    if (!rekamMedis) {
      return res.status(404).json({ message: 'Rekam medis tidak ditemukan' });
    }
    
    // TODO: Implementasi cetak PDF
    // Untuk tujuan pengembangan, kirim saja data JSON dulu
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rekam-medis.pdf');
    
    // Placeholder untuk pembuatan PDF - implementasi sesungguhnya perlu library PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const bytes = await pdfDoc.save();
    
    res.send(Buffer.from(bytes));
  } catch (error) {
    console.error('Gagal mencetak rekam medis:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mencetak rekam medis' });
  }
});

export default router;