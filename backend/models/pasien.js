import mongoose from 'mongoose';

const PasienSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    jenis: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    kategori: {
        type: String,
        required: true,
        enum: ['ternak', 'kesayangan / satwa liar', 'unggas']
    },
    jenis_kelamin: {
        type: String,
        required: false,
        enum: ['jantan', 'betina']
    },
    ras: {
        type: String,
        trim: true,
        maxlength: 250
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    umur: {
        type: Number,
        required: false,
        min: 0,
        max: 999 
    }
}, { timestamps: true });

export default mongoose.model('Pasien', PasienSchema);
