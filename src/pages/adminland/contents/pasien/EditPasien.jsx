import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './EditPasien.css';

const EditPasien = ({ pasien, onClose, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        jenis: '',
        kategori: 'ternak',
        jenis_kelamin: '',
        ras: '',
        umur: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});

    const kategoris = [
        { value: 'ternak', label: 'Ternak' },
        { value: 'kesayangan / satwa liar', label: 'Kesayangan / Satwa Liar' },
        { value: 'unggas', label: 'Unggas' }
    ];

    const jenisKelamins = [
        { value: '', label: 'Pilih Jenis Kelamin' },
        { value: 'jantan', label: 'Jantan' },
        { value: 'betina', label: 'Betina' }
    ];

    useEffect(() => {
        if (pasien) {
            const formattedData = {
                nama: pasien.nama || '',
                jenis: pasien.jenis || '',
                kategori: pasien.kategori || 'ternak',
                jenis_kelamin: pasien.jenis_kelamin || '',
                ras: pasien.ras || '',
                umur: pasien.umur !== undefined && pasien.umur !== null ? pasien.umur.toString() : ''
            };
            
            setFormData(formattedData);
            setOriginalData({...formattedData});
        }
    }, [pasien]);

    // Handle closing on escape key press
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        
        // Prevent scrolling on body when modal is open
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const validateField = (name, value) => {
        let errorMessage = '';
        
        switch (name) {
            case 'nama':
                if (!value.trim()) {
                    errorMessage = 'Nama pasien wajib diisi';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Nama pasien maksimal 100 karakter';
                }
                break;
            
            case 'jenis':
                if (!value.trim()) {
                    errorMessage = 'Jenis hewan wajib diisi';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Jenis hewan maksimal 100 karakter';
                }
                break;
            
            case 'kategori':
                if (!value) {
                    errorMessage = 'Kategori harus dipilih';
                } else if (!['ternak', 'kesayangan / satwa liar', 'unggas'].includes(value)) {
                    errorMessage = 'Kategori tidak valid';
                }
                break;
            
            case 'jenis_kelamin':
                if (value && !['jantan', 'betina', ''].includes(value)) {
                    errorMessage = 'Jenis kelamin tidak valid';
                }
                break;
            
            case 'ras':
                if (value && value.trim().length > 250) {
                    errorMessage = 'Ras maksimal 250 karakter';
                }
                break;
            
            case 'umur':
                if (value) {
                    // Replace comma with dot for decimal parsing
                    const normalizedValue = value.replace(',', '.');
                    const numValue = parseFloat(normalizedValue);
                    
                    if (isNaN(numValue) || numValue < 0) {
                        errorMessage = 'Umur harus berupa angka positif';
                    } else if (numValue > 999) {
                        errorMessage = 'Umur maksimal 999 tahun';
                    }
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
        
        const fieldsToCheck = ['nama', 'jenis', 'kategori', 'jenis_kelamin', 'ras', 'umur'];
        
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

    const handleBackdropClick = (e) => {
        // Close modal only if the backdrop itself is clicked
        if (e.target === e.currentTarget) {
            onClose();
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
            // Mempersiapkan data untuk update
            const updateData = {
                ...formData,
                id_user: pasien.id_user,
                // Convert umur to float and normalize comma to dot
                umur: formData.umur ? parseFloat(formData.umur.replace(',', '.')) : undefined
            };
            
            const response = await fetch(`http://localhost:5000/api/pasien/${pasien._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memperbarui pasien');
            }
            
            const result = await response.json();
            onUpdate(result.pasien);
            onClose();
            
        } catch (error) {
            console.error('Error saat memperbarui pasien:', error);
            setErrors({ general: error.message || 'Terjadi kesalahan saat memperbarui pasien' });
        } finally {
            setIsLoading(false);
        }
    };

    // Create the modal content
    const modalContent = (
        <div className="edit-popup-overlay" onClick={handleBackdropClick}>
            <div className="edit-popup" aria-modal="true" role="dialog">
                <div className="edit-header">
                    <h2>Edit Pasien</h2>
                    {/* <button 
                        className="close-button" 
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        &times;
                    </button> */}
                </div>
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memuat data...</div>}
                    
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="nama">Nama Pasien <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    className={errors.nama ? 'input-error' : ''}
                                    maxLength={100}
                                />
                                {errors.nama && <span className="error-text">{errors.nama}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="jenis">Jenis Hewan <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="jenis"
                                    name="jenis"
                                    value={formData.jenis}
                                    onChange={handleInputChange}
                                    className={errors.jenis ? 'input-error' : ''}
                                    maxLength={100}
                                />
                                {errors.jenis && <span className="error-text">{errors.jenis}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
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
                            
                            <div className="edit-form-group">
                                <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
                                <select
                                    id="jenis_kelamin"
                                    name="jenis_kelamin"
                                    value={formData.jenis_kelamin}
                                    onChange={handleInputChange}
                                    className={errors.jenis_kelamin ? 'input-error' : ''}
                                >
                                    {jenisKelamins.map(item => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.jenis_kelamin && <span className="error-text">{errors.jenis_kelamin}</span>}
                            </div>
                        </div>
                        
                        <div className="edit-form-row">
                            <div className="edit-form-group">
                                <label htmlFor="ras">Ras</label>
                                <input
                                    type="text"
                                    id="ras"
                                    name="ras"
                                    value={formData.ras}
                                    onChange={handleInputChange}
                                    className={errors.ras ? 'input-error' : ''}
                                    maxLength={250}
                                />
                                {errors.ras && <span className="error-text">{errors.ras}</span>}
                            </div>
                            
                            <div className="edit-form-group">
                                <label htmlFor="umur">Umur (tahun)</label>
                                <input
                                    type="text"
                                    id="umur"
                                    name="umur"
                                    value={formData.umur}
                                    onChange={handleInputChange}
                                    className={errors.umur ? 'input-error' : ''}
                                    placeholder="Contoh: 1.5 atau 1,5"
                                />
                                {errors.umur && <span className="error-text">{errors.umur}</span>}
                                <small className="helper-text">Gunakan titik (.) atau koma (,) untuk nilai desimal</small>
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

    // Using Portal to render the modal at the root level of the DOM
    return ReactDOM.createPortal(
        modalContent,
        document.body
    );
};

export default EditPasien;