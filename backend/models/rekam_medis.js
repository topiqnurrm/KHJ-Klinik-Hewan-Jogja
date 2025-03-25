const mongoose = require('mongoose');

const RekamMedisSchema = new mongoose.Schema({
    diagnosa: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    berat_badan: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,6}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Berat badan harus berupa angka dengan maksimal 6 digit dan 2 digit desimal.'
        }
    },
    suhu_badan: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,5}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Suhu badan harus berupa angka dengan maksimal 5 digit dan 2 digit desimal.'
        }
    },
    pemeriksaan: {
        type: String,
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    hasil: {
        type: String,
        required: true
    },
    id_kunjungan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kunjungan',
        required: true
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('RekamMedis', RekamMedisSchema);
