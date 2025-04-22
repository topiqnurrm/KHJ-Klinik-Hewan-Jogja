import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    id_pasien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasien',
        required: true
    },
    administrasis1: {
        type: [
          {
            id_user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: false
            },
            catatan: {
              type: String,
              required: false
            },
            status_administrasi: {
              type: String,
              enum: ['menunggu respon administrasi', 'disetujui administrasi', 'ditolak administrasi'],
              required: false
            },
            tanggal: {
              type: Date,
              default: Date.now
            },
          }
        ],
        default: []
    },
      
    pilih_tanggal: {
        type: Date,
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    keluhan: {
        type: String,
        required: true
    },
    pelayanans1: {
        type: [
          {
            id_pelayanan: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Pelayanan',
              required: false
            },
            jumlah: {
              type: Number,
              required: false
            },
            tanggal: {
              type: Date,
              default: Date.now
            }
          }
        ],
        default: []
    },
    status_booking: {
        type: String,
        enum: ['menunggu respon administrasi', 'disetujui administrasi', 'ditolak administrasi', 
               'sedang diperiksa', 'dirawat inap', 'dibatalkan administrasi', 
               'menunggu pembayaran', 'mengambil obat', 'selesai'],
              //  enum: ['menunggu', 'disetujui', 'ditolak', 
              //   'diproses', 'inap', 'dibatalkan', 
              //   'pembayaran', 'ambil_obat', 'selesai'],
        default: 'menunggu respon administrasi',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
