import mongoose from 'mongoose';

const RekamMedisSchema = new mongoose.Schema({
    diagnosa: {
        type: String,
        required: false,
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
        },
        default: 0
    },
    suhu_badan: {
        type: mongoose.Types.Decimal128,
        required: false,
        validate: {
            validator: function(value) {
                return /^\d{1,5}(\.\d{1,2})?$/.test(value.toString());
            },
            message: 'Suhu badan harus berupa angka dengan maksimal 5 digit dan 2 digit desimal.'
        },
        default: 0
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
                required: false
            },
            nama: {
                type: String,
                require: false
            },
            status: {
                type: String,
                enum: ['sedang diperiksa', 'dirawat inap', 'menunggu pembayaran', 'mengambil obat'],
                required: false
            },
            hasil: {
                type: String,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
            diagnosa: {
                type: String,
                required: false,
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
                },
            },
            suhu_badan: {
                type: mongoose.Types.Decimal128,
                required: false,
                validate: {
                    validator: function(value) {
                        return /^\d{1,5}(\.\d{1,2})?$/.test(value.toString());
                    },
                    message: 'Suhu badan harus berupa angka dengan maksimal 5 digit dan 2 digit desimal.'
                },
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
            nama: {
                type: String,
                required: false
            },
            kategori: {
                type: String,
                required: false,
            },
            jenis: {
                type: String,
                required: false,
                default: "-"
            },
            jumlah: {
                type: Number,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
            harga: {
                type: mongoose.Types.Decimal128,
                required: false,
                validate: {
                    validator: function(value) {
                        return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
                    },
                    message: 'Total obat harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
                }
            },
            subtotal_obat: {
                type: mongoose.Types.Decimal128,
                required: false,
                validate: {
                    validator: function(value) {
                        return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
                    },
                    message: 'Subtotal obat harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
                }
            },
        }
    ],
    pelayanans2: [
        {
            id_pelayanan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pelayanan',
                required: false
            },
            nama: {
                type: String,
                required: false
            },
            kategori: {
                type: String,
                required: false,
            },
            jumlah: {
                type: Number,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
            harga: {
                type: mongoose.Types.Decimal128,
                required: false,
                validate: {
                    validator: function(value) {
                        return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
                    },
                    message: 'Total pelayanan harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
                }
            },
            subtotal_pelayanan: {
                type: mongoose.Types.Decimal128,
                required: false,
                validate: {
                    validator: function(value) {
                        return /^\d{1,10}(\.\d{1,2})?$/.test(value.toString());
                    },
                    message: 'Subtotal pelayanan harus berupa angka dengan maksimal 10 digit dan 2 digit desimal.'
                }
            },
        }
    ],
}, { timestamps: true });

export default mongoose.model('RekamMedis', RekamMedisSchema);
