import mongoose from 'mongoose';

const PelayananSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true,
        maxlength: 250
    },
    kategori: {
        type: String,
        required: true,
        enum: ['tindakan_umum', 'tindakan_khusus', 'lain_lain']
    },
    harga_ternak: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                // Memastikan harga_ternak memiliki dua angka di belakang koma
                return /^\d{1,8}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Harga ternak harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    harga_kesayangan_satwaliar: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                // Memastikan harga_kesayangan_satwaliar memiliki dua angka di belakang koma
                return /^\d{1,8}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Harga kesayangan satwaliar harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
        }
    },
    harga_unggas: {
        type: mongoose.Types.Decimal128,
        required: true,
        validate: {
            validator: function(value) {
                // Memastikan harga_unggas memiliki dua angka di belakang koma
                return /^\d{1,8}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Harga unggas harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
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

export default mongoose.model('Pelayanan', PelayananSchema);
