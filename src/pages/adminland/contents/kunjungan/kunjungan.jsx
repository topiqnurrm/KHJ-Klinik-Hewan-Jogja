import React, { useState, useEffect } from 'react';
import './kunjungan.css';
import editIcon from "../../../../components/riwayat/gambar/kunjungan.png";
import Rekammedis from './rekammedis.jsx'; // Import komponen Rekammedis
import AddKunjungan from './AddKunjungan.jsx'; // Import komponen AddKunjungan
import { 
    getAllKunjungan, 
    searchKunjungan,
    hasEditPermission,
    hasAddPermission,
    getCurrentUser
} from '../../../../api/api-aktivitas-kunjungan';

const Kunjungan = () => {
    const [kunjungan, setKunjungan] = useState([]);
    const [filteredKunjungan, setFilteredKunjungan] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("tanggal_checkin");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State untuk menampilkan halaman rekam medis
    const [showRekamMedis, setShowRekamMedis] = useState(false);
    const [selectedKunjungan, setSelectedKunjungan] = useState(null);
    
    // State untuk notifications
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "error" // error, success, warning, info
    });
    
    // State untuk popup tambah kunjungan
    const [showAddKunjungan, setShowAddKunjungan] = useState(false);
    
    // State untuk menyimpan permission status
    const [canEdit, setCanEdit] = useState(false);
    const [canAdd, setCanAdd] = useState(false);

    const showNotification = (message, type = "error") => {
        setNotification({
            show: true,
            message: message,
            type: type
        });
        
        // Hapus notifikasi setelah 3 detik
        setTimeout(() => {
            setNotification({
                ...notification,
                show: false
            });
        }, 3000);
    };
    
    // Fetch user data dan set permissions
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Set permission flags
        setCanEdit(hasEditPermission());
        setCanAdd(hasAddPermission());
        
        // If no user or invalid permissions, show error
        if (!user) {
            showNotification("Silakan login untuk mengakses halaman ini", "error");
        }
    }, []);

    const fetchAllKunjungan = async () => {
        setIsLoading(true);
        try {
            const data = await getAllKunjungan();
            setKunjungan(data);
            setFilteredKunjungan(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Gagal fetch data kunjungan:', error);
            showNotification("Gagal memuat data kunjungan: " + (error.response?.data?.message || error.message), "error");
            setIsLoading(false);
            // Set empty arrays to prevent errors
            setKunjungan([]);
            setFilteredKunjungan([]);
        }
    };

    useEffect(() => {
        fetchAllKunjungan();
    }, []);

    // Handle search and sort
    useEffect(() => {
        if (kunjungan.length === 0) return;
        
        let filteredData = [...kunjungan];
        
        // Apply search filter if term exists
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filteredData = filteredData.filter((item) => {
                const allFields = `
                    ${item.nama_hewan || ""}
                    ${item.klien || ""}
                    ${item.jenis_layanan || ""} 
                    ${item.nomor_antri || ""}
                    ${item.status || ""}
                    ${new Date(item.tanggal_checkin).toLocaleString()}
                `.toLowerCase();
                return allFields.includes(lower);
            });
        }
        
        // Apply sorting
        if (sortBy) {
            filteredData.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "tanggal_checkin" || sortBy === "tanggal_edit") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "nama_hewan" || sortBy === "klien" || sortBy === "status" || sortBy === "jenis_layanan") {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                } else {
                    valueA = a[sortBy];
                    valueB = b[sortBy];
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredKunjungan(filteredData);
    }, [searchTerm, kunjungan, sortBy, sortOrder]);
    
    // Reset search filter
    const resetFilters = () => {
        setSearchTerm("");
        setFilteredKunjungan(kunjungan);
    };

    const handleEdit = (kunjunganItem) => {
        // Pastikan data keluhan dan kategori tersedia
        const completeData = {
            ...kunjunganItem,
            keluhan: kunjunganItem.keluhan || "",
            kategori: kunjunganItem.kategori || "",
            // Add new fields with fallback to empty values if not available
            layanan: kunjunganItem.layanan || "",
            jenis_kelamin: kunjunganItem.jenis_kelamin || "",
            ras: kunjunganItem.ras || "",
            umur: kunjunganItem.umur || ""
        };
        
        // Set selected kunjungan dan tampilkan halaman rekam medis
        setSelectedKunjungan(completeData);
        setShowRekamMedis(true);
    };

    // Handler untuk tombol tambah kunjungan
    const handleAddKunjungan = () => {
        
        // Tampilkan form atau modal tambah kunjungan
        setShowAddKunjungan(true);
    };

    // Handler untuk menutup modal tambah kunjungan
    const handleCloseAddKunjungan = () => {
        setShowAddKunjungan(false);
    };

    // Handler untuk update setelah tambah kunjungan
    const handleKunjunganCreated = (newKunjungan) => {
        // Refresh data kunjungan setelah penambahan berhasil
        fetchAllKunjungan();
        showNotification("Kunjungan berhasil ditambahkan!", "success");
    };

    // Handler untuk kembali ke halaman kunjungan dari rekam medis
    const handleBackFromRekamMedis = () => {
        setShowRekamMedis(false);
        setSelectedKunjungan(null);
        // Refresh data kunjungan setelah kembali dari rekam medis
        fetchAllKunjungan();
        // showNotification("Data kunjungan berhasil diperbarui", "success");
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "sedang diperiksa":
                return "status-biru";
            case "dirawat inap":
                return "status-biru";
            default:
                return "";
        }
    };
    
    // Format status display - keep full original status names
    const formatStatus = (status) => {
        return status || "";
    };

    // Format tanggal untuk tanggal_edit
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString();
    };

    // Get notification class based on type
    const getNotificationClass = () => {
        switch (notification.type) {
            case "success":
                return "success-notification";
            case "warning":
                return "warning-notification";
            case "info":
                return "info-notification";
            default:
                return "error-notification";
        }
    };

    // Conditional rendering - tampilkan Rekammedis atau daftar Kunjungan
    if (showRekamMedis && selectedKunjungan) {
        return <Rekammedis kunjunganData={selectedKunjungan} onBack={handleBackFromRekamMedis} />;
    }

    return (
        <div className='kunjungan-container'>
            <div className="dashboard-header">
                <h1>Aktivitas &gt; Kunjungan</h1>
            </div>
            
            {/* Notification system */}
            {notification.show && (
                <div className={getNotificationClass()}>
                    {notification.message}
                </div>
            )}
            
            <div className="riwayat-filter-container">
                <button 
                    className={`tambah-kunjungan-button ${!canAdd ? 'disabled-button' : ''}`} 
                    onClick={() => {
                        if (!canAdd) {
                            showNotification("Anda tidak memiliki izin untuk menambah kunjungan. Hanya Administrasi dan Superadmin yang diizinkan.", "error");
                        } else {
                            handleAddKunjungan();
                        }
                    }}
                >
                    + Tambah Kunjungan
                </button>
                <div className="riwayat-search-wrapper">
                    <label className="riwayat-search-label">Filter Pencarian</label>
                    <input
                        type="text"
                        className="riwayat-search-input"
                        placeholder="Cari data..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="riwayat-clear-button" onClick={() => setSearchTerm("")}>X</button>
                    )}
                </div>

                <div className="riwayat-sort-wrapper">
                    <select
                        className="riwayat-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Urutkan...</option>
                        <option value="tanggal_checkin">Tanggal Check-in</option>
                        <option value="tanggal_edit">Tanggal Edit</option>
                        <option value="nomor_antri">Nomor Antri</option>
                        <option value="nama_hewan">Nama Hewan</option>
                        <option value="jenis_layanan">Jenis Layanan</option>
                        <option value="klien">Klien</option>
                        <option value="status">Status</option>
                    </select>

                    <select
                        className="riwayat-sort-order"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>
            
            <div className="dashboard-content">
                {isLoading ? (
                    <div className="loading-indicator">Memuat data...</div>
                ) : (
                    <table className="riwayat-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal Check-in</th>
                                <th>Klien</th>
                                <th>Nama Hewan</th>
                                <th>Jenis Layanan</th>
                                <th>Nomor Antri</th>
                                <th>Status</th>
                                <th>tanggal edit</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKunjungan.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">Tidak ada data kunjungan dengan status yang ditentukan</td>
                                </tr>
                            ) : (
                                filteredKunjungan.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(item.tanggal_checkin).toLocaleString()}</td>
                                        <td>{item.klien}</td>
                                        <td>{item.nama_hewan}</td>
                                        <td>{item.jenis_layanan || "-"}</td>
                                        <td>{item.nomor_antri}</td>
                                        <td>
                                            <span className={`status-label ${getStatusClass(item.status)}`}>
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>
                                        <td>{formatDate(item.tanggal_edit)}</td>
                                        <td className="riwayat-actions">
                                            <button 
                                                className={`btn-green ${!canEdit ? 'disabled-button' : ''}`} 
                                                title="Rekam Medis" 
                                                onClick={() => {
                                                    if (!canEdit) {
                                                        showNotification("Anda tidak memiliki izin untuk mengedit kunjungan. Hanya Dokter dan Superadmin yang diizinkan.", "error");
                                                    } else {
                                                        handleEdit(item);
                                                    }
                                                }}
                                            >
                                                <img src={editIcon} alt="rekam medis" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Modal untuk Tambah Kunjungan */}
            {showAddKunjungan && (
                <AddKunjungan 
                    onClose={handleCloseAddKunjungan} 
                    onUpdate={handleKunjunganCreated}
                />
            )}
        </div>
    );
};

export default Kunjungan;