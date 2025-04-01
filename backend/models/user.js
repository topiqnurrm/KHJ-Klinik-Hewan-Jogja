const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    nama: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    telepon: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    alamat: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    aktor: {
        type: String,
        required: true,
        enum: ['superadmin', 'administrasi', 'pembayaran', 'dokter', 'klien']
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    gambar: {
        type: String,
        required: true,
        default: 'images/default-image.jpg',
        maxlength: 255
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
