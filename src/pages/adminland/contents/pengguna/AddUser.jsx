import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './AddUser.css';
import { createUser } from '../../../../api/api-user';

const AddUser = ({ onClose, onUpdate }) => {
    const [userData, setUserData] = useState({
        nama: '',
        email: '',
        telepon: '',
        password: '',
        alamat: '',
        aktor: '',
        gender: '',
        tanggal_lahir: '',
        gambar: '/images/default.png'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validation, setValidation] = useState({
        nama: '',
        email: '',
        telepon: '',
        password: '',
        alamat: '',
        aktor: '',
        gender: '',
        tanggal_lahir: ''
    });
    
    // State untuk melacak ketersediaan portal
    const [portalElement, setPortalElement] = useState(null);
    
    // Cek ketersediaan portal dan buat jika belum ada
    useEffect(() => {
        let element = document.getElementById('portal-root');
        
        // Jika portal-root tidak ada, buat element baru
        if (!element) {
            element = document.createElement('div');
            element.id = 'portal-root';
            document.body.appendChild(element);
        }
        
        setPortalElement(element);
        
        // Cleanup saat komponen unmount
        return () => {
            // Jika portal dibuat oleh komponen ini dan sudah tidak digunakan, hapus
            if (element && element.parentNode && !element.hasChildNodes()) {
                element.parentNode.removeChild(element);
            }
        };
    }, []);

    const validateField = (name, value) => {
        let errorMessage = '';
        
        switch (name) {
            case 'nama':
                if (!value.trim()) {
                    errorMessage = 'Nama tidak boleh kosong';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Nama maksimal 100 karakter';
                }
                break;
            
            case 'email':
                if (!value.trim()) {
                    errorMessage = 'Email tidak boleh kosong';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Format email tidak valid';
                } else if (value.length > 100) {
                    errorMessage = 'Email maksimal 100 karakter';
                }
                break;
            
            case 'telepon':
                if (!value.trim()) {
                    errorMessage = 'Nomor telepon tidak boleh kosong';
                } else if (value.length > 20) {
                    errorMessage = 'Nomor telepon maksimal 20 karakter';
                }
                break;
            
            case 'password':
                if (!value) {
                    errorMessage = 'Password tidak boleh kosong';
                } else if (value.length < 6) {
                    errorMessage = 'Password minimal 6 karakter';
                } else if (value.length > 100) {
                    errorMessage = 'Password maksimal 100 karakter';
                }
                break;
            
            case 'alamat':
                if (!value.trim()) {
                    errorMessage = 'Alamat tidak boleh kosong';
                }
                break;
            
            case 'aktor':
                if (!value) {
                    errorMessage = 'Peran harus dipilih';
                } else if (!['superadmin', 'administrasi', 'pembayaran', 'dokter', 'paramedis', 'klien'].includes(value)) {
                    errorMessage = 'Peran tidak valid';
                }
                break;
            
            case 'gender':
                if (!value) {
                    errorMessage = 'Gender harus dipilih';
                } else if (!['Laki-laki', 'Perempuan'].includes(value)) {
                    errorMessage = 'Gender tidak valid';
                }
                break;
            
            case 'tanggal_lahir':
                if (!value) {
                    errorMessage = 'Tanggal lahir harus diisi';
                } else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    if (isNaN(birthDate.getTime())) {
                        errorMessage = 'Format tanggal lahir tidak valid';
                    } else if (birthDate > today) {
                        errorMessage = 'Tanggal lahir tidak boleh di masa depan';
                    }
                }
                break;
            
            default:
                break;
        }
        
        return errorMessage;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Update field value
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
        
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
        Object.keys(userData).forEach(fieldName => {
            // Skip gambar field since it has a default value and is not in the form
            if (fieldName === 'gambar') return;
            
            const errorMessage = validateField(fieldName, userData[fieldName]);
            newValidation[fieldName] = errorMessage;
            
            if (errorMessage) {
                isValid = false;
            }
        });
        
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
            // Format tanggal lahir sebagai Date object untuk backend
            const formattedData = {
                ...userData,
                tanggal_lahir: new Date(userData.tanggal_lahir)
            };
            
            // Send data to API
            const result = await createUser(formattedData);
            
            if (result && result.user) {
                onUpdate(result.user); // Pass new user data back to parent
                onClose(); // Close the popup
            } else {
                setError('Gagal membuat pengguna baru');
            }
        } catch (error) {
            console.error('Gagal membuat user:', error);
            if (error.response?.status === 409) {
                setError('Email sudah terdaftar. Silakan gunakan email lain.');
            } else {
                setError(error.response?.data?.message || 'Gagal menambahkan pengguna baru');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        // Check if form has all required fields filled and no validation errors
        const requiredFields = ['nama', 'email', 'telepon', 'password', 'alamat', 'aktor', 'gender', 'tanggal_lahir'];
        const hasAllFields = requiredFields.every(field => userData[field]);
        
        // Check if there are any validation errors
        const hasNoErrors = Object.values(validation).every(error => !error);
        
        return hasAllFields && hasNoErrors;
    };

    // Jika portal belum tersedia, jangan render apapun
    if (!portalElement) {
        return null;
    }

    // Konten modal yang akan di-render ke portal
    const modalContent = (
        <div className="edit-popup-overlay">
            <div className="edit-popup">
                <div className="edit-header">
                    <h2>Tambah Pengguna Baru</h2>
                </div>
                
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memproses...</div>}
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama">Nama <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={userData.nama}
                                    onChange={handleChange}
                                    className={validation.nama ? 'input-error' : ''}
                                    maxLength={100}
                                />
                                {validation.nama && <span className="error-text">{validation.nama}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    className={validation.email ? 'input-error' : ''}
                                    maxLength={100}
                                />
                                {validation.email && <span className="error-text">{validation.email}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="telepon">Telepon <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="telepon"
                                    name="telepon"
                                    value={userData.telepon}
                                    onChange={handleChange}
                                    className={validation.telepon ? 'input-error' : ''}
                                    maxLength={20}
                                />
                                {validation.telepon && <span className="error-text">{validation.telepon}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="aktor">Peran <span className="required">*</span></label>
                                <select
                                    id="aktor"
                                    name="aktor"
                                    value={userData.aktor}
                                    onChange={handleChange}
                                    className={validation.aktor ? 'input-error' : ''}
                                >
                                    <option value="" disabled>Pilih Peran</option>
                                    <option value="superadmin">Superadmin</option>
                                    <option value="administrasi">Administrasi</option>
                                    <option value="pembayaran">Pembayaran</option>
                                    <option value="dokter">Dokter</option>
                                    <option value="paramedis">Paramedis</option>
                                    <option value="klien">Klien</option>
                                </select>
                                {validation.aktor && <span className="error-text">{validation.aktor}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="password">Password <span className="required">*</span></label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    className={validation.password ? 'input-error' : ''}
                                    minLength={6}
                                    maxLength={100}
                                />
                                {validation.password && <span className="error-text">{validation.password}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="alamat">Alamat <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="alamat"
                                    name="alamat"
                                    value={userData.alamat}
                                    onChange={handleChange}
                                    className={validation.alamat ? 'input-error' : ''}
                                />
                                {validation.alamat && <span className="error-text">{validation.alamat}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="gender">Gender <span className="required">*</span></label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={userData.gender}
                                    onChange={handleChange}
                                    className={validation.gender ? 'input-error' : ''}
                                >
                                    <option value="" disabled>Pilih Gender</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                                {validation.gender && <span className="error-text">{validation.gender}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="tanggal_lahir">Tanggal Lahir <span className="required">*</span></label>
                                <input
                                    type="date"
                                    id="tanggal_lahir"
                                    name="tanggal_lahir"
                                    value={userData.tanggal_lahir}
                                    onChange={handleChange}
                                    className={validation.tanggal_lahir ? 'input-error' : ''}
                                />
                                {validation.tanggal_lahir && <span className="error-text">{validation.tanggal_lahir}</span>}
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
                                disabled={isLoading || !isFormValid()}
                            >
                                {isLoading ? 'Memproses...' : 'Tambah'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    
    // Gunakan ReactDOM.createPortal untuk me-render modal ke elemen portal
    return ReactDOM.createPortal(modalContent, portalElement);
};

export default AddUser;