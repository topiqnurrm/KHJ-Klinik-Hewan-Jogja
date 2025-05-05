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
                enum: ['sedang diperiksa', 'dirawat inap', 'dibatalkan administrasi'],
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
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
        default: 'offline'
    },
    jenis_kelamin : {
        type: String,
        enum: ['jantan', 'betina', '-'],
        required: false,
        default: '-'
    },
    jenis: {
        type: String,
        required: false,
        maxlength: 100
    },
    ras: {
        type: String,
        required: false,
        maxlength: 250
    },
    umur_hewan: {
        type: Number,
        required: false,
        min: 0,
        max: 999 
    },
    kategori: {
        type: String,
        required: false,
        enum: ['ternak', 'kesayangan / satwa liar', 'unggas']
    },
}, { timestamps: true });

export default mongoose.model('Kunjungan', KunjunganSchema);
