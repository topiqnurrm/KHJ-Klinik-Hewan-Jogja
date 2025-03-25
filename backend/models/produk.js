const mongoose = require('mongoose');

const ProdukSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250
    },
    kategori: {
        type: String,
        required: true,
        enum: [
            'antibiotik', 'antijamur', 'antiradang', 'penenang', 'suplemen',
            'antisimtomatik', 'tetes', 'vaksin_hewan_kesayangan', 
            'vaksin_unggas', 'tambahan'
        ]
    },
    jenis: {
        type: String,
        required: true,
        enum: [
            'mililiter', 'tablet', 'kapsul', 'kaplet', 'botol', 'tube', 
            'vial', 'dosis', 'buah', 'kali'
        ]
    },
    harga: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                // Memastikan harga memiliki dua angka di belakang koma
                return /^\d{1,8}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Harga harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    stok: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                // Memastikan stok memiliki dua angka di belakang koma
                return /^\d{1,6}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Stok harus berupa angka dengan maksimal 8 digit dan 2 digit desimal.'
        }
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

module.exports = mongoose.model('Produk', ProdukSchema);
