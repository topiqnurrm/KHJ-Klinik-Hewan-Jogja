import mongoose from 'mongoose';

function generateRandomUserId(length = 9) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        unique: true,
        uppercase: true,
        match: /^[A-Z0-9]{9}$/,
        default: function () {
            return generateRandomUserId(9);
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    nama: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    telepon: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    alamat: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 100
    },
    aktor: {
        type: String,
        required: true,
        enum: ['superadmin', 'administrasi', 'pembayaran', 'dokter', 'klien', 'paramedis']
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    gambar: {
        type: String,
        required: true,
        default: '/images/default.png',
        maxlength: 255
    },
    gender: {
        type: String,
        enum: ['Laki-laki', 'Perempuan'],
        required: true
    },
    tanggal_lahir: {
        type: Date,
        required: true
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    try {
        if (!this.user_id) {
            let unique = false;
            while (!unique) {
                const candidate = generateRandomUserId();
                const existing = await mongoose.models.User.findOne({ user_id: candidate });
                if (!existing) {
                    this.user_id = candidate;
                    unique = true;
                }
            }
        }
        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model('User', UserSchema);
