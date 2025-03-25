const mongoose = require('mongoose');

const RekamMedisProdukSchema = new mongoose.Schema({
    jumlah: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                // Memastikan jumlah memiliki 6 digit sebelum koma dan 2 digit setelah koma
                return /^\d{1,6}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Jumlah harus berupa angka dengan maksimal 8 digit (6 digit sebelum koma dan 2 digit setelah koma).'
        }
    },
    id_rekam_medis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RekamMedis',
        required: true
    },
    id_produk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produk',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('RekamMedisProduk', RekamMedisProdukSchema);
