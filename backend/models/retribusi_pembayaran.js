const mongoose = require('mongoose');

const RetribusiPembayaranSchema = new mongoose.Schema({
    subtotal_obat: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Subtotal obat harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    total_obat: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Total obat harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    subtotal_pelayanan: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Subtotal pelayanan harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    total_pelayanan: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Total pelayanan harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    grand_total: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Grand total harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    metode_bayar: {
        type: String,
        enum: ['cash', 'debit', 'kredit', 'transfer', 'qris', 'ovo', 'gopay', 'dana', 'linkaja'],
        required: true
    },
    kembali: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Kembali harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    status_retribusi: {
        type: String,
        enum: ['pembayaran', 'ambil_obat', 'selesai'],
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
    },
    tanggal_bayar: {
        type: Date,
        default: null
    },
    tanggal_ambil_obat: {
        type: Date,
        default: null
    },
}, { timestamps: true });

module.exports = {
    RetribusiPembayaran: mongoose.model('RetribusiPembayaran', RetribusiPembayaranSchema)
};