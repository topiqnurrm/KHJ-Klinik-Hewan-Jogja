import mongoose from 'mongoose';

const RetribusiPembayaranSchema = new mongoose.Schema({
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
        required: false
    },
    kembali: {
        type: mongoose.Types.Decimal128,
        required: false,
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
        enum: ['menunggu pembayaran', 'mengambil obat', 'selesai'],
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
        required: false
    },
}, { timestamps: true });

export default mongoose.model('RetribusiPembayaran', RetribusiPembayaranSchema);
