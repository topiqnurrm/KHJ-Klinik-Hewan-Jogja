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
              enum: ['menunggu', 'disetujui', 'ditolak'],
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
        enum: ['menunggu', 'disetujui', 'ditolak', 
               'diproses', 'inap', 'dibatalkan', 
               'pembayaran', 'ambil_obat', 'selesai'],
        default: 'menunggu',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
