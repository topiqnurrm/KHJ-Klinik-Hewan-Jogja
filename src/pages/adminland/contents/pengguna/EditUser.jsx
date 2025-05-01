import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './EditUser.css';
import { getUserById, updateUser } from '../../../../api/api-user';

const EditUser = ({ userId, onClose, onUpdate }) => {
    const [userData, setUserData] = useState({
        nama: '',
        email: '',
        telepon: '',
        password: '',
        alamat: '',
        aktor: '',
        gender: '',
        tanggal_lahir: '',
        gambar: '/images/default.png' // Default value from schema
    });
    const [originalData, setOriginalData] = useState(null);
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

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const data = await getUserById(userId);
                if (data) {
                    // Format tanggal lahir untuk input type date
                    const formattedData = {
                        ...data,
                        // Pastikan password kosong saat awal edit
                        password: '',
                        tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir).toISOString().split('T')[0] : ''
                    };
                    setUserData(formattedData);
                    // Simpan data original untuk deteksi perubahan
                    setOriginalData({...formattedData});
                }
            } catch (error) {
                console.error('Gagal mengambil data user:', error);
                setError('Gagal mengambil data pengguna');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

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
                // Validasi password hanya jika diisi (opsional saat update)
                if (value && value.length < 6) {
                    errorMessage = 'Password minimal 6 karakter';
                } else if (value && value.length > 100) {
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
            // Skip password jika kosong (password opsional saat update)
            if (fieldName === 'password' && !userData[fieldName]) {
                return;
            }
            
            // Skip gambar field karena tidak diedit langsung di form
            if (fieldName === 'gambar') {
                return;
            }
            
            const errorMessage = validateField(fieldName, userData[fieldName]);
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
        
        // Cek semua field kecuali password dan gambar
        const fieldsToCheck = ['nama', 'email', 'telepon', 'alamat', 'aktor', 'gender', 'tanggal_lahir'];
        
        for (const field of fieldsToCheck) {
            if (userData[field] !== originalData[field]) {
                return true;
            }
        }
        
        // Cek password secara terpisah (jika diisi, berarti ada perubahan)
        if (userData.password.trim()) {
            return true;
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
            // Create update payload
            const updatePayload = {...userData};
            
            // Jika password kosong, hapus dari payload agar tidak menimpa password lama
            if (!updatePayload.password.trim()) {
                delete updatePayload.password;
            }
            
            // Format tanggal lahir sebagai Date object untuk backend
            if (updatePayload.tanggal_lahir) {
                updatePayload.tanggal_lahir = new Date(updatePayload.tanggal_lahir);
            }
            
            const result = await updateUser(userId, updatePayload);
            
            if (result) {
                onUpdate(result.user); // Pass updated user data back to parent
                onClose(); // Close the popup
            }
        } catch (error) {
            console.error('Gagal mengupdate user:', error);
            if (error.response?.status === 409) {
                setError('Email sudah digunakan oleh pengguna lain');
            } else {
                setError(error.response?.data?.message || 'Gagal menyimpan perubahan');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Content yang akan dirender menggunakan portal
    const content = (
        <div className="edit-popup-overlay">
            <div className="edit-popup">
                <div className="edit-header">
                    <h2>Edit Pengguna</h2>
                </div>
                
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memuat data...</div>}
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama">Nama <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={userData.nama || ''}
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
                                    value={userData.email || ''}
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
                                    value={userData.telepon || ''}
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
                                    value={userData.aktor || ''}
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
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={userData.password || ''}
                                    onChange={handleChange}
                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                    className={validation.password ? 'input-error' : ''}
                                    minLength={6}
                                    maxLength={100}
                                />
                                {validation.password && <span className="error-text">{validation.password}</span>}
                                {!validation.password && <span className="helper-text">Kosongkan jika tidak ingin mengubah password</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="alamat">Alamat <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="alamat"
                                    name="alamat"
                                    value={userData.alamat || ''}
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
                                    value={userData.gender || ''}
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
                                    value={userData.tanggal_lahir || ''}
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
    
    // Menggunakan createPortal untuk merender konten di DOM root
    return ReactDOM.createPortal(
        content,
        document.body // Tempatkan modal langsung di body
    );
};

export default EditUser;