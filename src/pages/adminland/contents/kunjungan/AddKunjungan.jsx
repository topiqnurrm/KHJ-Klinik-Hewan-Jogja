import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import './AddKunjungan.css';
import { createDirectKunjungan } from '../../../../api/api-aktivitas-kunjungan';
import { fetchLayanan } from '../../../../api/api-pelayanan';
import Popup from '../../../../pages/adminland/admin_nav/popup_nav/popup2'; // Import Popup component

const AddDirectKunjungan = ({ onClose, onUpdate }) => {
    // Dapatkan tanggal dan waktu saat ini dalam format yang sesuai
    const getCurrentDateTime = () => {
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
        return {
            date: dateString,
            time: timeString
        };
    };

    const defaultDateTime = getCurrentDateTime();

    const [kunjunganData, setKunjunganData] = useState({
        tanggal: defaultDateTime.date,
        waktu: defaultDateTime.time,
        nama_klein: '',
        nama_hewan: '',
        jenis_layanan: 'offline',
        jenis_kelamin: '-',
        jenis: '',
        ras: '',
        umur_hewan: '',
        kategori: 'kesayangan / satwa liar',
        keluhan: '',
        id_pelayanan: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validation, setValidation] = useState({
        tanggal: '',
        waktu: '',
        nama_klein: '',
        nama_hewan: '',
        jenis: '',
        ras: '',
        umur_hewan: '',
        kategori: '',
        keluhan: '',
        id_pelayanan: ''
    });

    // State for service options
    const [layananOptions, setLayananOptions] = useState([]);
    const [selectedLayanan, setSelectedLayanan] = useState(null);
    
    // State untuk melacak ketersediaan portal
    const [portalElement, setPortalElement] = useState(null);
    
    // State untuk mengontrol visibility popup konfirmasi
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    
    // Load services on component mount
    useEffect(() => {
        loadLayanan();
    }, []);

    // Load services from API
    const loadLayanan = async () => {
        try {
            const layananData = await fetchLayanan();
            const sortedLayanan = layananData.sort((a, b) => a.label.localeCompare(b.label));
            setLayananOptions(sortedLayanan);
        } catch (error) {
            console.error("Gagal mengambil data layanan:", error);
            setError("Gagal memuat data layanan");
        }
    };

    // Custom styles for react-select
    const customSelectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '38px',
            borderRadius: '4px',
            borderColor: validation.id_pelayanan ? '#ff3b30' : '#ced4da',
            boxShadow: 'none',
            '&:hover': {
                borderColor: validation.id_pelayanan ? '#ff3b30' : '#adb5bd',
            },
            // backgroundColor: '#e9e9e9'
            backgroundColor: '#f5f5f5 !important'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d',
            fontSize: '14px'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : null,
            color: state.isSelected ? 'white' : '#212529',
            '&:active': {
                backgroundColor: state.isSelected ? '#007bff' : '#e9ecef'
            }
        })
    };
    
    // Cek ketersediaan portal dan buat jika belum ada
    React.useEffect(() => {
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
            case 'nama_klein':
                if (!value) {
                    errorMessage = 'Nama klien harus diisi';
                } else if (value.length < 3) {
                    errorMessage = 'Nama klien minimal 3 karakter';
                } else if (value.length > 200) {
                    errorMessage = 'Nama klien maksimal 200 karakter';
                }
                break;
            
            case 'nama_hewan':
                if (!value) {
                    errorMessage = 'Nama hewan harus diisi';
                } else if (value.length < 3) {
                    errorMessage = 'Nama hewan minimal 3 karakter';
                } else if (value.length > 200) {
                    errorMessage = 'Nama hewan maksimal 200 karakter';
                }
                break;
            
            case 'tanggal':
                if (!value) {
                    errorMessage = 'Tanggal harus diisi';
                } else {
                    const visitDate = new Date(value);
                    if (isNaN(visitDate.getTime())) {
                        errorMessage = 'Format tanggal tidak valid';
                    }
                }
                break;
            
            case 'waktu':
                if (!value) {
                    errorMessage = 'Waktu harus diisi';
                } else {
                    // Validasi format waktu (HH:MM)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(value)) {
                        errorMessage = 'Format waktu tidak valid (HH:MM)';
                    }
                }
                break;
            
            case 'jenis':
                if (!value) {
                    errorMessage = 'Jenis hewan harus diisi';
                } else if (value.length > 100) {
                    errorMessage = 'Jenis hewan maksimal 100 karakter';
                }
                break;
            
            case 'ras':
                if (value && value.length > 250) {
                    errorMessage = 'Ras hewan maksimal 250 karakter';
                }
                break;
            
            case 'umur_hewan':
                if (value) {
                    // Pastikan nilai adalah angka
                    const numValue = Number(value);
                    
                    // Cek apakah input adalah angka valid (bukan NaN)
                    if (isNaN(numValue)) {
                        errorMessage = 'Umur hewan harus berupa angka';
                    }
                    // Validasi minimal 0
                    else if (numValue < 0) {
                        errorMessage = 'Umur hewan tidak boleh negatif';
                    }
                    // Validasi maksimal 999
                    else if (numValue > 999) {
                        errorMessage = 'Umur hewan maksimal 999';
                    }
                }
                break;
            
            case 'kategori':
                if (!value) {
                    errorMessage = 'Kategori hewan harus dipilih';
                }
                break;

            case 'keluhan':
                if (!value) {
                    errorMessage = 'Keluhan harus diisi';
                } else {
                    const wordCount = value.split(' ').length;
                    if (wordCount > 250) {
                        errorMessage = 'Keluhan tidak boleh lebih dari 250 kata';
                    }
                }
                break;
            
            case 'id_pelayanan':
                if (!value) {
                    errorMessage = 'Layanan harus dipilih';
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
        setKunjunganData(prev => ({
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

    // Handle service selection change
    const handleLayananChange = (selectedOption) => {
        setSelectedLayanan(selectedOption);
        
        // Update kunjunganData with the selected service ID
        setKunjunganData(prev => ({
            ...prev,
            id_pelayanan: selectedOption ? selectedOption.value : ''
        }));
        
        // Validate the field
        const errorMessage = validateField('id_pelayanan', selectedOption ? selectedOption.value : '');
        setValidation(prev => ({
            ...prev,
            id_pelayanan: errorMessage
        }));
    };

    const validateAllFields = () => {
        const newValidation = {};
        let isValid = true;
        
        // Validasi semua field
        Object.keys(validation).forEach(fieldName => {
            const errorMessage = validateField(fieldName, kunjunganData[fieldName]);
            newValidation[fieldName] = errorMessage;
            
            if (errorMessage) {
                isValid = false;
            }
        });
        
        setValidation(newValidation);
        return isValid;
    };

    // Handle untuk menampilkan popup konfirmasi
    const handleShowConfirmation = (e) => {
        e.preventDefault();
        
        // Validasi semua field sebelum menampilkan popup
        if (!validateAllFields()) {
            setError('Mohon perbaiki semua kesalahan pada form');
            return;
        }
        
        // Tampilkan popup konfirmasi
        setShowConfirmPopup(true);
    };

    // Handle untuk melakukan submission setelah konfirmasi
    const handleConfirmSubmit = async () => {
        setShowConfirmPopup(false);
        setIsLoading(true);
        setError('');
        
        try {
            // Gabungkan tanggal dan waktu menjadi satu string ISO
            const dateTimeString = `${kunjunganData.tanggal}T${kunjunganData.waktu}:00`;
            
            // Format umur_hewan as a number
            const umurHewan = kunjunganData.umur_hewan ? Number(kunjunganData.umur_hewan) : '';
            
            // Menyiapkan data layanan yang dipilih sesuai dengan format skema Mongoose
            const pelayanans1 = selectedLayanan ? [
                {
                    id_pelayanan: selectedLayanan.value,  // _id dari layanan
                    nama: selectedLayanan.label,          // nama layanan
                    jumlah: 1,                            // default 1
                    tanggal: new Date()                   // tambahkan tanggal sesuai skema
                }
            ] : [];
            
            // Dapatkan ID user dari localStorage
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const userId = user._id;
            
            if (!userId) {
                setError('User ID tidak ditemukan. Harap login ulang.');
                setIsLoading(false);
                return;
            }
            
            // Data yang akan dikirim ke API
            const dataToSubmit = {
                nama_klein: kunjunganData.nama_klein,
                nama_hewan: kunjunganData.nama_hewan,
                jenis_layanan: kunjunganData.jenis_layanan,
                jenis_kelamin: kunjunganData.jenis_kelamin,
                jenis: kunjunganData.jenis,
                ras: kunjunganData.ras || '-',
                umur_hewan: umurHewan,
                kategori: kunjunganData.kategori,
                keluhan: kunjunganData.keluhan,
                tanggal_waktu: dateTimeString,
                id_user: userId,
                id_pelayanan: kunjunganData.id_pelayanan,
                pelayanans1: pelayanans1
            };
            
            // console.log('Sending data to API:', dataToSubmit);
            
            // Send data to API
            const result = await createDirectKunjungan(dataToSubmit);
            
            if (result && result.kunjungan) {
                onUpdate(result.kunjungan);
                onClose();
            } else {
                setError('Gagal membuat kunjungan baru: Respons tidak valid');
            }
        } catch (error) {
            console.error('Gagal membuat kunjungan:', error);
            setError(error.response?.data?.message || 'Gagal menambahkan kunjungan baru');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        // Check if form has all required fields filled and no validation errors
        const requiredFields = ['nama_klein', 'nama_hewan', 'tanggal', 'waktu', 'kategori', 'jenis', 'keluhan', 'id_pelayanan'];
        const hasAllFields = requiredFields.every(field => kunjunganData[field]);
        
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
                    <h2>Tambah Kunjungan Langsung</h2>
                </div>
                
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memproses...</div>}
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleShowConfirmation}>
                        {/* Baris 1: Tanggal & Waktu Kunjungan */}
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="tanggal">Tanggal Kunjungan <span className="required">*</span></label>
                                <input
                                    type="date"
                                    id="tanggal"
                                    name="tanggal"
                                    value={kunjunganData.tanggal}
                                    onChange={handleChange}
                                    className={validation.tanggal ? 'input-error' : ''}
                                />
                                {validation.tanggal && <span className="error-text">{validation.tanggal}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="waktu">Waktu Kunjungan <span className="required">*</span></label>
                                <input
                                    type="time"
                                    id="waktu"
                                    name="waktu"
                                    value={kunjunganData.waktu}
                                    onChange={handleChange}
                                    className={validation.waktu ? 'input-error' : ''}
                                />
                                {validation.waktu && <span className="error-text">{validation.waktu}</span>}
                            </div>
                        </div>
                        
                        {/* Baris 2: Nama Klien & Nama Hewan */}
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama_klein">Nama Klien <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama_klein"
                                    name="nama_klein"
                                    value={kunjunganData.nama_klein}
                                    onChange={handleChange}
                                    className={validation.nama_klein ? 'input-error' : ''}
                                    placeholder="Masukkan nama klien"
                                />
                                {validation.nama_klein && <span className="error-text">{validation.nama_klein}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="nama_hewan">Nama Hewan <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama_hewan"
                                    name="nama_hewan"
                                    value={kunjunganData.nama_hewan}
                                    onChange={handleChange}
                                    className={validation.nama_hewan ? 'input-error' : ''}
                                    placeholder="Masukkan nama hewan"
                                />
                                {validation.nama_hewan && <span className="error-text">{validation.nama_hewan}</span>}
                            </div>
                        </div>

                        {/* Baris 3: Jenis Hewan & Kategori */}
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="jenis">Jenis Hewan <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="jenis"
                                    name="jenis"
                                    value={kunjunganData.jenis}
                                    onChange={handleChange}
                                    className={validation.jenis ? 'input-error' : ''}
                                    placeholder="Masukkan jenis hewan"
                                />
                                {validation.jenis && <span className="error-text">{validation.jenis}</span>}
                            </div>

                            <div className="edit-form-group">
                                <label htmlFor="kategori">Kategori <span className="required">*</span></label>
                                <select
                                    id="kategori"
                                    name="kategori"
                                    value={kunjunganData.kategori}
                                    onChange={handleChange}
                                    className={validation.kategori ? 'input-error' : ''}
                                >
                                    <option value="kesayangan / satwa liar">Kesayangan / Satwa Liar</option>
                                    <option value="ternak">Ternak</option>
                                    <option value="unggas">Unggas</option>
                                </select>
                                {validation.kategori && <span className="error-text">{validation.kategori}</span>}
                            </div>
                        </div>

                        {/* Baris 4: Ras & Jenis Kelamin */}
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="ras">Ras Hewan</label>
                                <input
                                    type="text"
                                    id="ras"
                                    name="ras"
                                    value={kunjunganData.ras}
                                    onChange={handleChange}
                                    className={validation.ras ? 'input-error' : ''}
                                    placeholder="Masukkan ras hewan"
                                />
                                {validation.ras && <span className="error-text">{validation.ras}</span>}
                            </div>

                            <div className="edit-form-group">
                                <label htmlFor="jenis_kelamin">Jenis Kelamin Hewan</label>
                                <select
                                    id="jenis_kelamin"
                                    name="jenis_kelamin"
                                    value={kunjunganData.jenis_kelamin}
                                    onChange={handleChange}
                                >
                                    <option value="-">-</option>
                                    <option value="jantan">Jantan</option>
                                    <option value="betina">Betina</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Baris 5: Umur Hewan & Jenis Layanan */}
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="umur_hewan">Umur Hewan (tahun)</label>
                                <input
                                    type="text"
                                    id="umur_hewan"
                                    name="umur_hewan"
                                    value={kunjunganData.umur_hewan}
                                    onChange={handleChange}
                                    className={validation.umur_hewan ? 'input-error' : ''}
                                    placeholder="Masukkan umur hewan"
                                />
                                {validation.umur_hewan && <span className="error-text">{validation.umur_hewan}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="jenis_layanan">Jenis Layanan (default offline)</label>
                                <input
                                    type="text"
                                    id="jenis_layanan"
                                    name="jenis_layanan"
                                    value={kunjunganData.jenis_layanan}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                        </div>

                        {/* Baris 6: Pilih Layanan */}
                        <div className="edit-form-row">
                            <div className="edit-form-group full-width">
                                <label htmlFor="id_pelayanan">Pilih Layanan <span className="required">*</span></label>
                                <Select
                                    id="id_pelayanan"
                                    styles={customSelectStyles}
                                    options={layananOptions}
                                    placeholder="Pilih Layanan"
                                    onChange={handleLayananChange}
                                    value={selectedLayanan}
                                    isDisabled={isLoading}
                                    classNamePrefix="select"
                                    isSearchable={true}
                                />
                                {validation.id_pelayanan && <span className="error-text">{validation.id_pelayanan}</span>}
                            </div>
                        </div>

                        {/* Baris 7: Keluhan */}
                        <div className="edit-form-row">
                            <div className="edit-form-group full-width">
                                <label htmlFor="keluhan">Keluhan <span className="required">*</span></label>
                                <textarea
                                    id="keluhan"
                                    name="keluhan"
                                    value={kunjunganData.keluhan}
                                    onChange={handleChange}
                                    className={validation.keluhan ? 'input-error' : ''}
                                    placeholder="Masukkan keluhan"
                                    rows="4"
                                    style={{ backgroundColor: '#f5f5f5' }}
                                ></textarea>
                                {validation.keluhan && <span className="error-text">{validation.keluhan}</span>}
                                <span className="info-text">Maksimal 250 kata</span>
                            </div>
                        </div>

                    </form>
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
                        className="simpan-button"
                        onClick={handleShowConfirmation}
                        disabled={isLoading || !isFormValid()}
                    >
                        {isLoading ? 'Memproses...' : 'Tambah'}
                    </button>
                </div>
            </div>
            
            {/* Popup Konfirmasi */}
            <Popup
                isOpen={showConfirmPopup}
                onClose={() => setShowConfirmPopup(false)}
                title="Konfirmasi Tambah Kunjungan"
                description="Apakah Anda yakin ingin menambahkan kunjungan ini?"
                onConfirm={handleConfirmSubmit}
            />
        </div>
    );
    
    // Gunakan ReactDOM.createPortal untuk me-render modal ke elemen portal
    return ReactDOM.createPortal(modalContent, portalElement);
};

export default AddDirectKunjungan;