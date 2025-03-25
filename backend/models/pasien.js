const mongoose = require('mongoose');

const PasienSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    jenis: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    kategori: {
        type: String,
        required: true,
        enum: ['ternak', 'kesayangan / satwa liar', 'unggas']
    },
    jenis_kelamin: {
        type: String,
        required: true,
        enum: ['jantan', 'betina']
    },
    ras: {
        type: String,
        trim: true,
        maxlength: 250
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Pasien', PasienSchema);
