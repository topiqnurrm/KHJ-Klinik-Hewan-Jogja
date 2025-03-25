const mongoose = require('mongoose');

const RekamMedisPelayananSchema = new mongoose.Schema({
    jumlah: {
        type: Number,
        required: true
    },
    id_rekam_medis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RekamMedis',
        required: true
    },
    id_pelayanan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pelayanan',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('RekamMedisPelayanan', RekamMedisPelayananSchema);
