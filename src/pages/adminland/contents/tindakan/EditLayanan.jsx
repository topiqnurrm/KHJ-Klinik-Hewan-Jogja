import React, { useState, useEffect } from 'react';
import './EditLayanan.css';

const EditLayanan = ({ layanan, onClose, onUpdate }) => {
    const [layananData, setLayananData] = useState({
        nama: '',
        kategori: '',
        harga_ternak: '',
        harga_kesayangan_satwaliar: '',
        harga_unggas: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validation, setValidation] = useState({
        nama: '',
        kategori: '',
        harga_ternak: '',
        harga_kesayangan_satwaliar: '',
        harga_unggas: ''
    });

    useEffect(() => {
        if (!layanan) return;
        
        try {
            // Format harga untuk input type number
            const formattedData = {
                ...layanan,
                harga_ternak: parseFloat(layanan.harga_ternak?.toString() || "0"),
                harga_kesayangan_satwaliar: parseFloat(layanan.harga_kesayangan_satwaliar?.toString() || "0"),
                harga_unggas: parseFloat(layanan.harga_unggas?.toString() || "0")
            };
            
            setLayananData(formattedData);
            // Simpan data original untuk deteksi perubahan
            setOriginalData({...formattedData});
        } catch (error) {
            console.error('Gagal memformat data layanan:', error);
            setError('Gagal memformat data layanan');
        }
    }, [layanan]);

    const validateField = (name, value) => {
        let errorMessage = '';
        
        switch (name) {
            case 'nama':
                if (!value.trim()) {
                    errorMessage = 'Nama layanan tidak boleh kosong';
                } else if (value.trim().length > 250) {
                    errorMessage = 'Nama layanan maksimal 250 karakter';
                }
                break;
            
            case 'kategori':
                if (!value) {
                    errorMessage = 'Kategori harus dipilih';
                } else if (!['tindakan_umum', 'tindakan_khusus', 'lain_lain'].includes(value)) {
                    errorMessage = 'Kategori tidak valid';
                }
                break;
            
            case 'harga_ternak':
                if (value === '' || value === null || isNaN(parseFloat(value))) {
                    errorMessage = 'Harga ternak tidak boleh kosong dan harus berupa angka';
                } else if (parseFloat(value) < 0) {
                    errorMessage = 'Harga ternak tidak boleh negatif';
                } else if (String(value).includes('.') && String(value).split('.')[1]?.length > 2) {
                    errorMessage = 'Harga ternak maksimal 2 digit di belakang koma';
                } else if (String(value).length > 10) {
                    errorMessage = 'Harga ternak terlalu besar';
                }
                break;
            
            case 'harga_kesayangan_satwaliar':
                if (value === '' || value === null || isNaN(parseFloat(value))) {
                    errorMessage = 'Harga kesayangan/satwa liar tidak boleh kosong dan harus berupa angka';
                } else if (parseFloat(value) < 0) {
                    errorMessage = 'Harga kesayangan/satwa liar tidak boleh negatif';
                } else if (String(value).includes('.') && String(value).split('.')[1]?.length > 2) {
                    errorMessage = 'Harga kesayangan/satwa liar maksimal 2 digit di belakang koma';
                } else if (String(value).length > 10) {
                    errorMessage = 'Harga kesayangan/satwa liar terlalu besar';
                }
                break;
            
            case 'harga_unggas':
                if (value === '' || value === null || isNaN(parseFloat(value))) {
                    errorMessage = 'Harga unggas tidak boleh kosong dan harus berupa angka';
                } else if (parseFloat(value) < 0) {
                    errorMessage = 'Harga unggas tidak boleh negatif';
                } else if (String(value).includes('.') && String(value).split('.')[1]?.length > 2) {
                    errorMessage = 'Harga unggas maksimal 2 digit di belakang koma';
                } else if (String(value).length > 10) {
                    errorMessage = 'Harga unggas terlalu besar';
                }
                break;
            
            default:
                break;
        }
        
        return errorMessage;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Untuk field harga, konversi ke number jika diperlukan
        if (['harga_ternak', 'harga_kesayangan_satwaliar', 'harga_unggas'].includes(name)) {
            // Izinkan input kosong untuk sementara agar user bisa mengetik
            const newValue = value === '' ? '' : value;
            
            setLayananData(prev => ({
                ...prev,
                [name]: newValue
            }));
        } else {
            // Update field lainnya
            setLayananData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Validate the field
        const errorMessage = validateField(name, value);
        setValidation(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    const validateAllFields = () => {
        const newValidation = {};
        let isValid = true;
        
        // Validasi semua field
        Object.keys(layananData).forEach(fieldName => {
            if (fieldName === '_id' || fieldName === 'id_user' || 
                fieldName === 'tanggal' || fieldName === 'createdAt' || 
                fieldName === 'updatedAt' || fieldName === '__v') {
                return; // Skip fields yang tidak di-edit
            }
            
            const errorMessage = validateField(fieldName, layananData[fieldName]);
            newValidation[fieldName] = errorMessage;
            
            if (errorMessage) {
                isValid = false;
            }
        });
        
        setValidation(newValidation);
        return isValid;
    };

    // Fungsi untuk mengecek apakah data sudah berubah
    const hasDataChanged = () => {
        if (!originalData) return false;
        
        // Cek semua field yang dapat diedit
        const fieldsToCheck = ['nama', 'kategori', 'harga_ternak', 'harga_kesayangan_satwaliar', 'harga_unggas'];
        
        for (const field of fieldsToCheck) {
            // Konversi nilai ke string sebelum membandingkan untuk menghindari perbandingan tipe data
            const currentValue = layananData[field] !== undefined && layananData[field] !== null 
                ? layananData[field].toString() 
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi semua field sebelum submit
        if (!validateAllFields()) {
            setError('Mohon perbaiki semua kesalahan pada form');
            return;
        }
        
        // Cek apakah ada perubahan data
        if (!hasDataChanged()) {
            setError('Data tidak berubah');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Pastikan nilai harga adalah angka yang valid
            // Jika nilai input adalah string kosong, gunakan nilai default 0
            const harga_ternak = layananData.harga_ternak === '' || isNaN(parseFloat(layananData.harga_ternak)) 
                ? 0 
                : parseFloat(layananData.harga_ternak);
                
            const harga_kesayangan_satwaliar = layananData.harga_kesayangan_satwaliar === '' || isNaN(parseFloat(layananData.harga_kesayangan_satwaliar)) 
                ? 0 
                : parseFloat(layananData.harga_kesayangan_satwaliar);
                
            const harga_unggas = layananData.harga_unggas === '' || isNaN(parseFloat(layananData.harga_unggas)) 
                ? 0 
                : parseFloat(layananData.harga_unggas);
            
            // Create update payload
            const updatePayload = {
                nama: layananData.nama,
                kategori: layananData.kategori,
                harga_ternak: harga_ternak,
                harga_kesayangan_satwaliar: harga_kesayangan_satwaliar,
                harga_unggas: harga_unggas
            };
            
            console.log('Sending update payload:', updatePayload);
            
            // Lakukan API call untuk update
            const response = await fetch(`http://localhost:5000/api/pelayanan/${layanan._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memperbarui layanan');
            }
            
            const result = await response.json();
            
            if (result) {
                onUpdate(result); // Pass updated data back to parent
                onClose(); // Close the popup
            }
        } catch (error) {
            console.error('Gagal mengupdate layanan:', error);
            setError(error.message || 'Gagal menyimpan perubahan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="edit-popup-overlay">
            <div className="edit-popup">
                <div className="edit-header">
                    <h2>Edit Layanan</h2>
                </div>
                
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memuat data...</div>}
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama">Nama Layanan <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={layananData.nama || ''}
                                    onChange={handleChange}
                                    className={validation.nama ? 'input-error' : ''}
                                    maxLength={250}
                                />
                                {validation.nama && <span className="error-text">{validation.nama}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="kategori">Kategori <span className="required">*</span></label>
                                <select
                                    id="kategori"
                                    name="kategori"
                                    value={layananData.kategori || ''}
                                    onChange={handleChange}
                                    className={validation.kategori ? 'input-error' : ''}
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    <option value="tindakan_umum">Tindakan Umum</option>
                                    <option value="tindakan_khusus">Tindakan Khusus</option>
                                    <option value="lain_lain">Lain-lain</option>
                                </select>
                                {validation.kategori && <span className="error-text">{validation.kategori}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="harga_ternak">Harga Ternak (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga_ternak"
                                    name="harga_ternak"
                                    value={layananData.harga_ternak}
                                    onChange={handleChange}
                                    className={validation.harga_ternak ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                />
                                {validation.harga_ternak && <span className="error-text">{validation.harga_ternak}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="harga_kesayangan_satwaliar">Harga Kesayangan/Satwa Liar (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga_kesayangan_satwaliar"
                                    name="harga_kesayangan_satwaliar"
                                    value={layananData.harga_kesayangan_satwaliar}
                                    onChange={handleChange}
                                    className={validation.harga_kesayangan_satwaliar ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                />
                                {validation.harga_kesayangan_satwaliar && <span className="error-text">{validation.harga_kesayangan_satwaliar}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="harga_unggas">Harga Unggas (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga_unggas"
                                    name="harga_unggas"
                                    value={layananData.harga_unggas}
                                    onChange={handleChange}
                                    className={validation.harga_unggas ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                />
                                {validation.harga_unggas && <span className="error-text">{validation.harga_unggas}</span>}
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
};

export default EditLayanan;