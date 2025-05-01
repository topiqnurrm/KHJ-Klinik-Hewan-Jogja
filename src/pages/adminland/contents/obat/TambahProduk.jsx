import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TambahProduk.css';

const TambahProdukPortal = ({ onClose, onAdd }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        kategori: 'antibiotik',
        jenis: 'mililiter',
        harga: '',
        stok: '',
        id_user: '' // Tambahkan id_user field
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        nama: false,
        kategori: false,
        jenis: false,
        harga: false,
        stok: false
    });
    const [generalError, setGeneralError] = useState('');

    const kategoris = [
        { value: 'antibiotik', label: 'Antibiotik' },
        { value: 'antijamur', label: 'Antijamur' },
        { value: 'antiradang', label: 'Antiradang' },
        { value: 'penenang', label: 'Penenang' },
        { value: 'suplemen', label: 'Suplemen' },
        { value: 'antisimtomatik', label: 'Antisimtomatik' },
        { value: 'tetes', label: 'Tetes' },
        { value: 'vaksin_hewan_kesayangan', label: 'Vaksin Hewan Kesayangan' },
        { value: 'vaksin_unggas', label: 'Vaksin Unggas' },
        { value: 'tambahan', label: 'Tambahan' }
    ];

    const jeniss = [
        { value: 'mililiter', label: 'Mililiter' },
        { value: 'tablet', label: 'Tablet' },
        { value: 'kapsul', label: 'Kapsul' },
        { value: 'kaplet', label: 'Kaplet' },
        { value: 'botol', label: 'Botol' },
        { value: 'tube', label: 'Tube' },
        { value: 'vial', label: 'Vial' },
        { value: 'dosis', label: 'Dosis' },
        { value: 'buah', label: 'Buah' },
        { value: 'kali', label: 'Kali' }
    ];

    // Mendapatkan ID user dari localStorage saat komponen di-mount
    useEffect(() => {
        // Ambil data user dari localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (userData && userData._id) {
            setFormData(prev => ({
                ...prev,
                id_user: userData._id
            }));
        } else {
            // Jika user ID tidak tersedia, tampilkan error
            setGeneralError('User ID tidak ditemukan. Silakan login kembali.');
        }
    }, []);

    const validateField = (name, value) => {
        let errorMessage = '';
        
        switch (name) {
            case 'nama':
                if (!value.trim()) {
                    errorMessage = 'Nama obat wajib diisi';
                } else if (value.trim().length > 250) {
                    errorMessage = 'Nama obat maksimal 250 karakter';
                }
                break;
            
            case 'harga':
                if (value === '' || value === null || isNaN(parseFloat(value))) {
                    errorMessage = 'Harga wajib diisi dan harus berupa angka';
                } else if (parseFloat(value) <= 0) {
                    errorMessage = 'Harga harus lebih dari 0';
                } else if (String(value).includes('.') && String(value).split('.')[1]?.length > 2) {
                    errorMessage = 'Harga maksimal 2 digit di belakang koma';
                } else if (String(value).length > 10) {
                    errorMessage = 'Harga terlalu besar (maksimal 10 digit)';
                }
                break;
            
            case 'stok':
                if (value === '' || value === null || isNaN(parseFloat(value))) {
                    errorMessage = 'Stok wajib diisi dan harus berupa angka';
                } else if (parseFloat(value) < 0) {
                    errorMessage = 'Stok tidak boleh negatif';
                } else if (String(value).includes('.') && String(value).split('.')[1]?.length > 2) {
                    errorMessage = 'Stok maksimal 2 digit di belakang koma';
                } else if (String(value).length > 8) {
                    errorMessage = 'Stok terlalu besar (maksimal 8 digit)';
                }
                break;
            
            default:
                break;
        }
        
        return errorMessage;
    };

    const validateAllFields = () => {
        const newErrors = {};
        let isValid = true;
        
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(formData).forEach(field => {
            if (field !== 'id_user') { // Skip id_user validation
                allTouched[field] = true;
            }
        });
        setTouched(allTouched);
        
        // Validasi semua field kecuali id_user
        Object.keys(formData).forEach(fieldName => {
            if (fieldName !== 'id_user' && fieldName !== 'kategori' && fieldName !== 'jenis') {
                const errorMessage = validateField(fieldName, formData[fieldName]);
                if (errorMessage) {
                    newErrors[fieldName] = errorMessage;
                    isValid = false;
                }
            }
        });
        
        // Cek juga apakah id_user ada
        if (!formData.id_user) {
            isValid = false;
            setGeneralError('User ID tidak ditemukan. Silakan login kembali.');
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Tandai field ini sebagai touched
        setTouched({
            ...touched,
            [name]: true
        });
        
        // Validasi saat user mengetik - validasi real-time
        if (touched[name]) {
            const errorMessage = validateField(name, value);
            setErrors({
                ...errors,
                [name]: errorMessage
            });
        }
    };

    // Handle blur event untuk validasi langsung saat user meninggalkan field
    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        // Tandai field sebagai touched
        setTouched({
            ...touched,
            [name]: true
        });
        
        // Validasi saat blur
        const errorMessage = validateField(name, value);
        setErrors({
            ...errors,
            [name]: errorMessage
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi semua field sebelum submit
        if (!validateAllFields()) {
            setGeneralError('Mohon perbaiki semua kesalahan pada form');
            return;
        }
        
        setIsLoading(true);
        setGeneralError('');
        
        try {
            // Mendapatkan ID user dari local storage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = userData._id || formData.id_user;
            
            if (!userId) {
                throw new Error('User ID tidak ditemukan. Silakan login kembali.');
            }
            
            const response = await fetch('http://localhost:5000/api/produk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: formData.nama,
                    kategori: formData.kategori,
                    jenis: formData.jenis,
                    harga: parseFloat(formData.harga),
                    stok: parseFloat(formData.stok),
                    id_user: userId
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menambahkan obat');
            }
            
            const result = await response.json();
            onAdd(result);
            onClose();
            
        } catch (error) {
            console.error('Error saat menambahkan obat:', error);
            setGeneralError(error.message || 'Terjadi kesalahan saat menambahkan obat');
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk mengecek apakah form valid untuk mengaktifkan/menonaktifkan tombol submit
    const isFormValid = () => {
        // Check if all required fields are filled and there are no validation errors
        const requiredFields = ['nama', 'harga', 'stok'];
        const allFieldsFilled = requiredFields.every(key => 
            formData[key] !== '' && formData[key] !== null);
        
        const noValidationErrors = Object.values(errors).every(val => !val);
        
        // Also check if id_user exists
        return allFieldsFilled && noValidationErrors && formData.id_user && !generalError;
    };

    // Component untuk konten popup
    const PopupContent = (
        <div className="tambah-popup-overlay-produk">
            <div className="tambah-popup">
                <div className="tambah-header">
                    <h2>Tambah Obat</h2>
                    {/* <button className="close-button" onClick={onClose}>×</button> */}
                </div>
                <div className="tambah-content">
                    {isLoading && <div className="loading-text">Memuat data...</div>}
                    
                    {generalError && <div className="error-message">{generalError}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="tambah-form-row">
                            <div className="tambah-form-group">
                                <label htmlFor="nama">Nama Obat <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={errors.nama && touched.nama ? 'input-error' : ''}
                                    maxLength={250}
                                    placeholder="Masukkan nama obat"
                                />
                                {errors.nama && touched.nama && <span className="error-text">{errors.nama}</span>}
                            </div>
                            
                            <div className="tambah-form-group">
                                <label htmlFor="kategori">Kategori <span className="required">*</span></label>
                                <select
                                    id="kategori"
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleInputChange}
                                >
                                    {kategoris.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="tambah-form-row">
                            <div className="tambah-form-group">
                                <label htmlFor="jenis">Jenis <span className="required">*</span></label>
                                <select
                                    id="jenis"
                                    name="jenis"
                                    value={formData.jenis}
                                    onChange={handleInputChange}
                                >
                                    {jeniss.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="tambah-form-group">
                                <label htmlFor="harga">Harga (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga"
                                    name="harga"
                                    value={formData.harga}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={errors.harga && touched.harga ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                                {errors.harga && touched.harga && <span className="error-text">{errors.harga}</span>}
                            </div>
                        </div>
                        
                        <div className="tambah-form-row">
                            <div className="tambah-form-group">
                                <label htmlFor="stok">Stok <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="stok"
                                    name="stok"
                                    value={formData.stok}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={errors.stok && touched.stok ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                                {errors.stok && touched.stok && <span className="error-text">{errors.stok}</span>}
                            </div>
                            
                            <div className="tambah-form-group">
                                {/* Placeholder untuk menjaga layout seimbang */}
                            </div>
                        </div>
                        
                        <div className="tambah-actions">
                            <button 
                                type="button" 
                                className="batal-button" 
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="simpan-button"
                                disabled={isLoading || !isFormValid()}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Gunakan ReactDOM.createPortal untuk me-render komponen ke elemen root
    return ReactDOM.createPortal(
        PopupContent,
        document.getElementById('portal-root') || document.body
    );
};

const TambahProduk = (props) => {
    return <TambahProdukPortal {...props} />;
};

export default TambahProduk;