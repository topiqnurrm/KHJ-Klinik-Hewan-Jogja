import mongoose from 'mongoose';

const RekamMedisSchema = new mongoose.Schema({
    diagnosa: {
        type: String,
        required: false,
        trim: true,
        maxlength: 255
    },
    berat_badan: {
        type: mongoose.Types.Decimal128,
        required: false,
        validate: {
            validator: function(value) {
                return /^\d{1,6}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Berat badan harus berupa angka dengan maksimal 6 digit dan 2 digit desimal.'
        }
    },
    suhu_badan: {
        type: mongoose.Types.Decimal128,
        required: false,
        validate: {
            validator: function(value) {
                return /^\d{1,5}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Suhu badan harus berupa angka dengan maksimal 5 digit dan 2 digit desimal.'
        }
    },
    pemeriksaan: {
        type: String,
        required: false
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    hasil: {
        type: String,
        required: false
    },
    id_kunjungan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kunjungan',
        required: true
    },
    dokters: [
        {
            id_user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            hasil: {
                type: String,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
    produks: [
        {
            id_produk: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Produk',
                required: false
            },
            jumlah: {
                type: Number,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
    pelayanans2: [
        {
            id_pelayanan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pelayanan',
                required: true
            },
            jumlah: {
                type: Number,
                required: true
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
}, { timestamps: true });

export default mongoose.model('RekamMedis', RekamMedisSchema);
