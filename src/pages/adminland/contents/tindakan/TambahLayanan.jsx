import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TambahLayanan.css'; // Make sure this CSS file exists

const TambahLayanan = ({ onClose, onAdd }) => {
    const [layananData, setLayananData] = useState({
        nama: '',
        kategori: '',
        harga_ternak: '',
        harga_kesayangan_satwaliar: '',
        harga_unggas: '',
        id_user: '' // Add id_user field
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validation, setValidation] = useState({
        nama: '',
        kategori: '',
        harga_ternak: '',
        harga_kesayangan_satwaliar: '',
        harga_unggas: ''
    });
    const [touched, setTouched] = useState({
        nama: false,
        kategori: false,
        harga_ternak: false,
        harga_kesayangan_satwaliar: false,
        harga_unggas: false
    });

    // Get user ID from localStorage when component mounts
    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (userData && userData._id) {
            setLayananData(prev => ({
                ...prev,
                id_user: userData._id
            }));
        } else {
            // If user ID is not available, set an error
            setError('User ID tidak ditemukan. Silakan login kembali.');
        }
    }, []);

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
        
        // Validate the field as user types - real-time validation
        if (touched[name]) {
            const errorMessage = validateField(name, value);
            setValidation(prev => ({
                ...prev,
                [name]: errorMessage
            }));
        }
    };

    // Handle blur event for immediate validation when user leaves a field
    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate on blur
        const errorMessage = validateField(name, value);
        setValidation(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    const validateAllFields = () => {
        const newValidation = {};
        let isValid = true;
        
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(layananData).forEach(field => {
            if (field !== 'id_user') { // Skip id_user validation
                allTouched[field] = true;
            }
        });
        setTouched(allTouched);
        
        // Validasi semua field kecuali id_user
        Object.keys(layananData).forEach(fieldName => {
            if (fieldName !== 'id_user') { // Skip id_user validation
                const errorMessage = validateField(fieldName, layananData[fieldName]);
                newValidation[fieldName] = errorMessage;
                
                if (errorMessage) {
                    isValid = false;
                }
            }
        });
        
        // Also check if id_user exists
        if (!layananData.id_user) {
            isValid = false;
            setError('User ID tidak ditemukan. Silakan login kembali.');
        }
        
        setValidation(newValidation);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi semua field sebelum submit
        if (!validateAllFields()) {
            setError('Mohon perbaiki semua kesalahan pada form');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Pastikan nilai harga adalah angka yang valid
            const harga_ternak = layananData.harga_ternak === '' || isNaN(parseFloat(layananData.harga_ternak)) 
                ? 0 
                : parseFloat(layananData.harga_ternak);
                
            const harga_kesayangan_satwaliar = layananData.harga_kesayangan_satwaliar === '' || isNaN(parseFloat(layananData.harga_kesayangan_satwaliar)) 
                ? 0 
                : parseFloat(layananData.harga_kesayangan_satwaliar);
                
            const harga_unggas = layananData.harga_unggas === '' || isNaN(parseFloat(layananData.harga_unggas)) 
                ? 0 
                : parseFloat(layananData.harga_unggas);
            
            // Create payload for new layanan with id_user
            const createPayload = {
                nama: layananData.nama,
                kategori: layananData.kategori,
                harga_ternak: harga_ternak,
                harga_kesayangan_satwaliar: harga_kesayangan_satwaliar,
                harga_unggas: harga_unggas,
                id_user: layananData.id_user // Include id_user in the payload
            };
            
            console.log('Sending create payload:', createPayload);
            
            // Lakukan API call untuk create layanan baru
            const response = await fetch('http://localhost:5000/api/pelayanan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createPayload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menambahkan layanan');
            }
            
            const result = await response.json();
            
            if (result) {
                onAdd(result); // Pass new data back to parent
                onClose(); // Close the popup
            }
        } catch (error) {
            console.error('Gagal menambahkan layanan:', error);
            setError(error.message || 'Gagal menyimpan layanan baru');
        } finally {
            setIsLoading(false);
        }
    };

    // Cek jika form valid untuk aktifkan/non-aktifkan tombol submit
    const isFormValid = () => {
        // Cek semua field terisi dan tidak ada error validasi
        const requiredFields = ['nama', 'kategori', 'harga_ternak', 'harga_kesayangan_satwaliar', 'harga_unggas'];
        const allFieldsFilled = requiredFields.every(key => 
            layananData[key] !== '' && layananData[key] !== null);
        
        const noValidationErrors = Object.values(validation).every(val => val === '');
        
        // Also check if id_user exists
        return allFieldsFilled && noValidationErrors && layananData.id_user;
    };

    // Create modal content
    const modalContent = (
        <div className="tambah-popup-overlay">
            <div className="tambah-popup">
                <div className="tambah-header">
                    <h2>Tambah Layanan Baru</h2>
                </div>
                
                <div className="tambah-content">
                    {isLoading && <div className="loading-text">Memproses...</div>}
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="tambah-form-row">
                            <div className="tambah-form-group">
                                <label htmlFor="nama">Nama Layanan <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={layananData.nama || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={validation.nama && touched.nama ? 'input-error' : ''}
                                    maxLength={250}
                                    placeholder="Masukkan nama layanan"
                                />
                                {validation.nama && touched.nama && 
                                  <span className="error-text">{validation.nama}</span>}
                            </div>
                            
                            <div className="tambah-form-group">
                                <label htmlFor="kategori">Kategori <span className="required">*</span></label>
                                <select
                                    id="kategori"
                                    name="kategori"
                                    value={layananData.kategori || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={validation.kategori && touched.kategori ? 'input-error' : ''}
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    <option value="tindakan_umum">Tindakan Umum</option>
                                    <option value="tindakan_khusus">Tindakan Khusus</option>
                                    <option value="lain_lain">Lain-lain</option>
                                </select>
                                {validation.kategori && touched.kategori && 
                                  <span className="error-text">{validation.kategori}</span>}
                            </div>
                        </div>
                        
                        <div className="tambah-form-row">
                            <div className="tambah-form-group">
                                <label htmlFor="harga_ternak">Harga Ternak (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga_ternak"
                                    name="harga_ternak"
                                    value={layananData.harga_ternak}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={validation.harga_ternak && touched.harga_ternak ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                                {validation.harga_ternak && touched.harga_ternak && 
                                  <span className="error-text">{validation.harga_ternak}</span>}
                            </div>
                            
                            <div className="tambah-form-group">
                                <label htmlFor="harga_kesayangan_satwaliar">Harga Kesayangan/Satwa Liar (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga_kesayangan_satwaliar"
                                    name="harga_kesayangan_satwaliar"
                                    value={layananData.harga_kesayangan_satwaliar}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={validation.harga_kesayangan_satwaliar && touched.harga_kesayangan_satwaliar ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                                {validation.harga_kesayangan_satwaliar && touched.harga_kesayangan_satwaliar && 
                                  <span className="error-text">{validation.harga_kesayangan_satwaliar}</span>}
                            </div>
                        </div>
                        
                        <div className="tambah-form-row">
                            <div className="tambah-form-group">
                                <label htmlFor="harga_unggas">Harga Unggas (Rp) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="harga_unggas"
                                    name="harga_unggas"
                                    value={layananData.harga_unggas}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={validation.harga_unggas && touched.harga_unggas ? 'input-error' : ''}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                                {validation.harga_unggas && touched.harga_unggas && 
                                  <span className="error-text">{validation.harga_unggas}</span>}
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
                                {isLoading ? 'Menambahkan...' : 'Tambah'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Use React Portal to render the modal at the document body level
    return ReactDOM.createPortal(
        modalContent,
        document.body
    );
};

export default TambahLayanan;