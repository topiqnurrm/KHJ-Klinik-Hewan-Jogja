import mongoose from 'mongoose';

const KunjunganSchema = new mongoose.Schema({
    administrasis2: [
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
            status_kunjungan: {
                type: String,
                enum: ['sedang diperiksa', 'dirawat inap', 'dibatalkan administrasi', 'menunggu pembayaran', 'mengambil obat', 'selesai'],
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
    biaya: {
        type: mongoose.Types.Decimal128,
        required: false,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Grand total harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        },
        // default: "0",
    },
    id_booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    no_antri: {
        type: String,
        required: true,
        maxlength: 10,
        minlength: 1
    },
    nama_klein : {
        type: String,
        required: false,
        maxlength: 200,
        minlength: 3
    },
    nama_hewan : {
        type: String,
        required: false,
        maxlength: 200,
        minlength: 3
    },
    jenis_layanan: {
        type: String,
        enum: ['onsite', 'house call', 'offline'],
        required: false,
    },
    jenis_kelamin : {
        type: String,
        enum: ['jantan', 'betina', '-'],
        required: true,
        default: '-',
    },
    jenis: {
        type: String,
        required: false,
        maxlength: 100
    },
    ras: {
        type: String,
        required: true,
        maxlength: 250,
        default: '-',
    },
    umur_hewan: {
        type: String,
        required: true,
        min: 0,
        max: 999 ,
        default: '-',
    },
    kategori: {
        type: String,
        required: false,
        enum: ['ternak', 'kesayangan / satwa liar', 'unggas']
    },
    keluhan: {
        type: String,
        required: false,
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
}, { timestamps: true });

export default mongoose.model('Kunjungan', KunjunganSchema);
