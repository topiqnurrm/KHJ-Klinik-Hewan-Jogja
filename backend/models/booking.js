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
              enum: ['menunggu respon administrasi', 'disetujui administrasi', 'ditolak administrasi',
                 'sedang diperiksa', 'dibatalkan administrasi'],
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
    biaya: {
        type: mongoose.Types.Decimal128,
        required: false,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Grand total harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        },
        default: 0,
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    nama: {
      type: String,
      required: true,
    },
    kategori: {
      type: String,
      enum: ['ternak', 'kesayangan / satwa liar', 'unggas'],
      required: true,

    },
    keluhan: {
      type: String,
      required: true,
      validate: {
          validator: function(value) {
              const wordCount = value.split(' ').length;
              return wordCount <= 250;  // Validasi agar keluhan tidak lebih dari 250 kata
          },
          message: 'Keluhan tidak boleh lebih dari 250 kata'
      }
    },
    pelayanans1: {
        type: [
          {
            id_pelayanan: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Pelayanan',
              required: false
            },
            nama: {
              type: String,
              require: false,
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
    },
    jenis_layanan: {
      type: String,
      enum: ['onsite', 'house call'],
      required: true,
      default: 'onsite'
    },
    alamat: {
      type: String,
      required: true,
      default: "Klinik KHJ"
    },
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
