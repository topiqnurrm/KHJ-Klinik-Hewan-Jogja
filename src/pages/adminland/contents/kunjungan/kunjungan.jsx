import React, { useState, useEffect } from 'react';
import './kunjungan.css';
import editIcon from "../../../../components/riwayat/gambar/kunjungan.png";
import Rekammedis from './rekammedis.jsx'; // Import komponen Rekammedis
import AddKunjungan from './AddKunjungan.jsx'; // Import komponen AddKunjungan
import { 
    getAllKunjungan, 
    searchKunjungan,
    hasEditPermission,
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
    
    // State untuk error message
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    // State untuk popup tambah kunjungan
    const [showAddKunjungan, setShowAddKunjungan] = useState(false);

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setShowError(true);
        
        // Hapus pesan error setelah 3 detik
        setTimeout(() => {
            setShowError(false);
        }, 3000);
    };
    
    // Fetch user data
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
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
            showErrorMessage("Gagal memuat data kunjungan: " + (error.response?.data?.message || error.message));
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
        // Check if user has permission to edit
        if (!hasEditPermission()) {
            showErrorMessage("Anda tidak memiliki izin untuk mengedit kunjungan. Hanya Administrasi, Dokter, dan Superadmin yang diizinkan.");
            return;
        }
        
        // Set selected kunjungan dan tampilkan halaman rekam medis
        setSelectedKunjungan(kunjunganItem);
        setShowRekamMedis(true);
    };

    // Handler untuk tombol tambah kunjungan
    const handleAddKunjungan = () => {
        // Check if user has permission to add
        if (!hasEditPermission()) {
            showErrorMessage("Anda tidak memiliki izin untuk menambah kunjungan. Hanya Administrasi, Dokter, dan Superadmin yang diizinkan.");
            return;
        }
        
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
    };

    // Handler untuk kembali ke halaman kunjungan dari rekam medis
    const handleBackFromRekamMedis = () => {
        setShowRekamMedis(false);
        setSelectedKunjungan(null);
        // Refresh data kunjungan setelah kembali dari rekam medis
        fetchAllKunjungan();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "menunggu respon administrasi":
                return "status-kuning";
            case "disetujui administrasi":
                return "status-kuning";
            case "sedang diperiksa":
                return "status-biru";
            case "dirawat inap":
                return "status-biru";
            case "dibatalkan administrasi":
                return "status-merah";
            case "selesai":
                return "status-hijau";
            default:
                return "";
        }
    };
    
    // Format status display - keep full original status names
    const formatStatus = (status) => {
        return status || "";
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
            
            {/* Error notification */}
            {showError && (
                <div className="error-notification">
                    {errorMessage}
                </div>
            )}
            
            <div className="riwayat-filter-container">
                <button 
                    className={`tambah-kunjungan-button ${!hasEditPermission() ? 'disabled-button' : ''}`} 
                    onClick={handleAddKunjungan}
                    disabled={!hasEditPermission()}
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
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKunjungan.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-data">Tidak ada data kunjungan</td>
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
                                        <td className="riwayat-actions">
                                            <button 
                                                className={`btn-green ${!hasEditPermission() ? 'disabled-button' : ''}`} 
                                                title="Rekam Medis" 
                                                onClick={() => handleEdit(item)}
                                                disabled={!hasEditPermission()}
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