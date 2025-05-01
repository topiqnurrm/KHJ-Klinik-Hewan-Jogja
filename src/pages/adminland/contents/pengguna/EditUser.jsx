import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './EditUser.css';
import { getUserById, updateUser, sendVerificationEmail } from '../../../../api/api-user';
import Popup from '../../admin_nav/popup_nav/popup2'; // Import komponen Popup yang sudah ada

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
        gambar: null
    });
    const [originalEmail, setOriginalEmail] = useState("");
    const [originalData, setOriginalData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState("");
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [formIsValid, setFormIsValid] = useState(false);
    const [dataChanged, setDataChanged] = useState(false);

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
                    setOriginalEmail(data.email || "");
                }
            } catch (error) {
                console.error('Gagal mengambil data user:', error);
                showError('Gagal mengambil data pengguna');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Validasi form setiap kali data berubah
    useEffect(() => {
        if (originalData) {
            // Check if data has changed first
            const changedStatus = hasDataChanged();
            setDataChanged(changedStatus);
            
            // Check form validity
            const isValid = checkFormValidity();
            
            // Button should be enabled only if both: form is valid AND data has changed
            setFormIsValid(isValid && changedStatus);
        }
    }, [userData, originalData]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
    };

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(''), 3000);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^[0-9+]+$/.test(phone);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "image/png") {
                showError("Hanya gambar PNG yang diperbolehkan.");
                return;
            }
            setUserData(prev => ({ ...prev, gambar: file }));
            setFileName(file.name);
        }
    };

    const isEmailChanged = () => {
        return userData.email !== originalEmail;
    };

    const handleSendVerificationEmail = async (email, password) => {
        try {
            await sendVerificationEmail(email, password);
        } catch (err) {
            console.error("Email verifikasi gagal:", err);
            showError("Gagal mengirim email verifikasi.");
        }
    };

    const hasDataChanged = () => {
        if (!originalData) return false;
        
        return (
            userData.nama !== originalData.nama ||
            userData.gender !== originalData.gender ||
            userData.telepon !== originalData.telepon ||
            userData.email !== originalData.email ||
            userData.tanggal_lahir !== originalData.tanggal_lahir ||
            userData.alamat !== originalData.alamat ||
            userData.aktor !== originalData.aktor ||
            userData.password.length > 0 ||
            userData.gambar !== null
        );
    };

    const checkFormValidity = () => {
        const { nama, email, password, telepon, alamat, aktor, gender, tanggal_lahir } = userData;
        
        // Validasi dasar
        const isValidEmail = email && validateEmail(email) && email.length <= 100;
        const isValidPassword = isEmailChanged() ? (password && password.length >= 6 && password.length <= 100) : (password === '' || (password.length >= 6 && password.length <= 100));
        const isValidPhone = telepon && validatePhone(telepon) && telepon.length <= 20;
        
        // Cek validitas seluruh form
        const isValid = 
            nama && nama.length <= 100 &&
            isValidEmail &&
            isValidPassword &&
            isValidPhone &&
            alamat &&
            aktor &&
            gender && ["Laki-laki", "Perempuan"].includes(gender) &&
            tanggal_lahir;
            
        return isValid;
    };

    const validateForm = () => {
        const { nama, email, password, telepon, alamat, aktor, gender, tanggal_lahir } = userData;

        if (!nama || nama.length > 100) {
            showError("Nama wajib diisi dan maksimal 100 karakter.");
            return false;
        }
        if (!email || !validateEmail(email) || email.length > 100) {
            showError("Email wajib diisi, format harus valid, dan maksimal 100 karakter.");
            return false;
        }
        
        if (isEmailChanged() && !password) {
            showError("Password wajib diisi jika mengubah email.");
            return false;
        }
        
        if (password && (password.length < 6 || password.length > 100)) {
            showError("Password minimal 6 karakter dan maksimal 100 karakter.");
            return false;
        }
        if (!telepon || !validatePhone(telepon) || telepon.length > 20) {
            showError("Telepon wajib diisi, hanya angka atau +, maksimal 20 karakter.");
            return false;
        }
        if (!alamat) {
            showError("Alamat wajib diisi.");
            return false;
        }
        if (!aktor) {
            showError("Peran harus dipilih.");
            return false;
        }
        if (!gender || !["Laki-laki", "Perempuan"].includes(gender)) {
            showError("Gender wajib dipilih.");
            return false;
        }
        if (!tanggal_lahir) {
            showError("Tanggal lahir wajib diisi.");
            return false;
        }

        const tahun = parseInt(tanggal_lahir.split("-")[0], 10);
        if (tahun < 1900 || tahun > 2099) {
            showError("Tahun lahir harus antara 1900 dan 2099.");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!dataChanged) {
            showError("Tidak ada perubahan.");
            return;
        }

        if (!validateForm()) {
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
            
            const result = await updateUser(userId, updatePayload);
            
            if (result && result.user) {
                // Kirim email verifikasi jika email atau password diubah
                if (
                    (userData.email && userData.email !== originalEmail) ||
                    (userData.password && userData.password.length > 0)
                ) {
                    await handleSendVerificationEmail(userData.email, userData.password);
                }
                
                onUpdate(result.user); // Pass updated user data back to parent
                onClose(); // Close the popup
            } else {
                showError(result?.message || "Gagal memperbarui data.");
            }
        } catch (error) {
            console.error('Gagal mengupdate user:', error);
            if (error.response?.status === 409) {
                showError('Email sudah digunakan oleh pengguna lain');
            } else {
                showError(error.response?.data?.message || 'Gagal menyimpan perubahan');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveClick = () => {
        if (!dataChanged) {
            showError("Tidak ada perubahan.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setShowConfirmPopup(true);
    };

    // Content yang akan dirender menggunakan portal
    const content = (
        <div className="edit-popup-overlay">
            <div className="edit-popup">
                <div className="edit-header">
                    <h2>Edit Pengguna</h2>
                </div>
                
                <div className="edit-content">
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama">Nama <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={userData.nama || ''}
                                    onChange={handleChange}
                                    className={userData.nama !== originalData?.nama ? 'edited' : ''}
                                    maxLength={100}
                                />
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email || ''}
                                    onChange={handleChange}
                                    className={userData.email !== originalData?.email ? 'edited' : ''}
                                    maxLength={100}
                                />
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
                                    className={userData.telepon !== originalData?.telepon ? 'edited' : ''}
                                    maxLength={20}
                                />
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="password">{isEmailChanged() ? 'Password * (Wajib diisi jika email diubah)' : 'Password'}</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={userData.password || ''}
                                    onChange={handleChange}
                                    placeholder={isEmailChanged() ? "Password wajib diisi" : "Kosongkan jika tidak ingin mengubah"}
                                    className={userData.password ? 'edited' : isEmailChanged() ? 'edited required' : ''}
                                    required={isEmailChanged()}
                                    minLength={6}
                                    maxLength={100}
                                />
                                {!isEmailChanged() && <span className="helper-text">Kosongkan jika tidak ingin mengubah password</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="aktor">Peran <span className="required">*</span></label>
                                <select
                                    id="aktor"
                                    name="aktor"
                                    value={userData.aktor || ''}
                                    onChange={handleChange}
                                    className={userData.aktor !== originalData?.aktor ? 'edited' : ''}
                                >
                                    <option value="" disabled>Pilih Peran</option>
                                    <option value="superadmin">Superadmin</option>
                                    <option value="administrasi">Administrasi</option>
                                    <option value="pembayaran">Pembayaran</option>
                                    <option value="dokter">Dokter</option>
                                    <option value="paramedis">Paramedis</option>
                                    <option value="klien">Klien</option>
                                </select>
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="alamat">Alamat <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="alamat"
                                    name="alamat"
                                    value={userData.alamat || ''}
                                    onChange={handleChange}
                                    className={userData.alamat !== originalData?.alamat ? 'edited' : ''}
                                />
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
                                    className={userData.gender !== originalData?.gender ? 'edited' : ''}
                                >
                                    <option value="" disabled>Pilih Gender</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="tanggal_lahir">Tanggal Lahir <span className="required">*</span></label>
                                <input
                                    type="date"
                                    id="tanggal_lahir"
                                    name="tanggal_lahir"
                                    value={userData.tanggal_lahir || ''}
                                    onChange={handleChange}
                                    className={userData.tanggal_lahir !== formatDate(originalData?.tanggal_lahir) ? 'edited' : ''}
                                    min="1900-01-01" 
                                    max="2099-12-31"
                                />
                            </div>
                        </div>

                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="gambar">Gambar Profile</label>
                                <div className="file-input-wrapper">
                                    <label className="custom-file-upload-inside">
                                        <span className="upload-button">Pilih Gambar</span>
                                        <input 
                                            type="file" 
                                            accept="image/png" 
                                            onChange={handleFileChange} 
                                            id="gambar"
                                        />
                                        <span className="file-name-inside">{fileName ? `File: ${fileName}` : "Belum ada file"}</span>
                                    </label>
                                </div>
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
                                type="button" 
                                className={`simpan-button ${!formIsValid ? 'disabled' : ''}`}
                                onClick={handleSaveClick}
                                disabled={isLoading || !formIsValid}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Menggunakan komponen Popup2 untuk konfirmasi */}
            <Popup
                isOpen={showConfirmPopup}
                onClose={() => setShowConfirmPopup(false)}
                title="Konfirmasi Perubahan"
                description="Anda yakin ingin menyimpan perubahan data pengguna ini?"
                onConfirm={handleSubmit}
            />
        </div>
    );
    
    // Menggunakan createPortal untuk merender konten di DOM root
    return ReactDOM.createPortal(
        content,
        document.body // Tempatkan modal langsung di body
    );
};

export default EditUser;