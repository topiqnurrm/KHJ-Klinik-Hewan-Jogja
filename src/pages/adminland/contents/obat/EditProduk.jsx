import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './EditProduk.css';

const EditProduk = ({ produk, onClose, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        kategori: 'antibiotik',
        jenis: 'mililiter',
        harga: '',
        stok: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});

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

    // Fungsi untuk mengkonversi nilai Decimal128 ke string untuk input
    const getDecimalValue = (value) => {
        if (!value) return '';
        
        if (typeof value === 'object') {
            // MongoDB Decimal128 conversion
            if (value.$numberDecimal) {
                return value.$numberDecimal;
            } else if (value.toString) {
                const strValue = value.toString();
                return strValue.replace(/[^\d.-]/g, '');
            }
        }
        
        return value.toString();
    };

    useEffect(() => {
        if (produk) {
            const formattedData = {
                nama: produk.nama || '',
                kategori: produk.kategori || 'antibiotik',
                jenis: produk.jenis || 'mililiter',
                harga: getDecimalValue(produk.harga),
                stok: getDecimalValue(produk.stok)
            };
            
            setFormData(formattedData);
            setOriginalData({...formattedData});
        }
    }, [produk]);

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
            
            case 'kategori':
                if (!value) {
                    errorMessage = 'Kategori harus dipilih';
                } else if (!['antibiotik', 'antijamur', 'antiradang', 'penenang', 'suplemen',
                    'antisimtomatik', 'tetes', 'vaksin_hewan_kesayangan', 
                    'vaksin_unggas', 'tambahan'].includes(value)) {
                    errorMessage = 'Kategori tidak valid';
                }
                break;
            
            case 'jenis':
                if (!value) {
                    errorMessage = 'Jenis harus dipilih';
                } else if (!['mililiter', 'tablet', 'kapsul', 'kaplet', 'botol', 'tube', 
                    'vial', 'dosis', 'buah', 'kali'].includes(value)) {
                    errorMessage = 'Jenis tidak valid';
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
        
        // Validasi semua field
        Object.keys(formData).forEach(fieldName => {
            const errorMessage = validateField(fieldName, formData[fieldName]);
            if (errorMessage) {
                newErrors[fieldName] = errorMessage;
                isValid = false;
            }
        });
        
        setErrors(newErrors);
        return isValid;
    };

    // Fungsi untuk mengecek apakah data sudah berubah
    const hasDataChanged = () => {
        if (!originalData) return false;
        
        const fieldsToCheck = ['nama', 'kategori', 'jenis', 'harga', 'stok'];
        
        for (const field of fieldsToCheck) {
            const currentValue = formData[field] !== undefined && formData[field] !== null 
                ? formData[field].toString() 
                : '';
            const originalValue = originalData[field] !== undefined && originalData[field] !== null 
                ? originalData[field].toString() 
                : '';
            
            if (currentValue !== originalValue) {
                return true;
            }
        }
        
        return false;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when field is being edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: undefined
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateAllFields()) {
            return;
        }

        // Cek apakah ada perubahan data
        if (!hasDataChanged()) {
            setErrors({ general: 'Data tidak berubah' });
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Mendapatkan ID user dari local storage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = userData._id;
            
            if (!userId) {
                throw new Error('User ID tidak ditemukan. Silakan login kembali.');
            }
            
            const response = await fetch(`http://localhost:5000/api/produk/${produk._id}`, {
                method: 'PUT',
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
                throw new Error(errorData.message || 'Gagal memperbarui obat');
            }
            
            const result = await response.json();
            onUpdate(result);
            onClose();
            
        } catch (error) {
            console.error('Error saat memperbarui obat:', error);
            setErrors({ general: error.message || 'Terjadi kesalahan saat memperbarui obat' });
        } finally {
            setIsLoading(false);
        }
    };

    // Konten modal yang akan dirender ke portal
    const modalContent = (
        <div className="edit-popup-overlay">
            <div className="edit-popup">
                <div className="edit-header">
                    <h2>Edit Obat</h2>
                </div>
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memuat data...</div>}
                    
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama">Nama Obat <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    className={errors.nama ? 'input-error' : ''}
                                    maxLength={250}
                                />
                                {errors.nama && <span className="error-text">{errors.nama}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="kategori">Kategori <span className="required">*</span></label>
                                <select
                                    id="kategori"
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleInputChange}
                                    className={errors.kategori ? 'input-error' : ''}
                                >
                                    {kategoris.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.kategori && <span className="error-text">{errors.kategori}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="jenis">Jenis <span className="required">*</span></label>
                                <select
                                    id="jenis"
                                    name="jenis"
                                    value={formData.jenis}
                                    onChange={handleInputChange}
                                    className={errors.jenis ? 'input-error' : ''}
                                >
                                    {jeniss.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.jenis && <span className="error-text">{errors.jenis}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="harga">Harga (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga"
                                    name="harga"
                                    value={formData.harga}
                                    onChange={handleInputChange}
                                    className={errors.harga ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                />
                                {errors.harga && <span className="error-text">{errors.harga}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="stok">Stok <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="stok"
                                    name="stok"
                                    value={formData.stok}
                                    onChange={handleInputChange}
                                    className={errors.stok ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                />
                                {errors.stok && <span className="error-text">{errors.stok}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                {/* Placeholder untuk menjaga layout seimbang */}
                            </div>
                        </div>
                        
                        <div className="edit-actions">
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
                                disabled={isLoading || !hasDataChanged()}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Menggunakan Portal untuk merender di luar hierarki komponen
    return ReactDOM.createPortal(
        modalContent,
        document.body // Render ke document.body untuk memastikan posisi di depan
    );
};

export default EditProduk;