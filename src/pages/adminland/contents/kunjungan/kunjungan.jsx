import React, { useState, useEffect } from 'react';
import './kunjungan.css';
import editIcon from "../../../../components/riwayat/gambar/kunjungan.png";

const Kunjungan = () => {
    const [kunjungan, setKunjungan] = useState([]);
    const [filteredKunjungan, setFilteredKunjungan] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("tanggal_checkin");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState({ aktor: 'superadmin' }); // Dummy user for testing
    
    // State untuk error message
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setShowError(true);
        
        // Hapus pesan error setelah 3 detik
        setTimeout(() => {
            setShowError(false);
        }, 3000);
    };

    // Dummy data
    const dummyData = [
        {
            _id: '1',
            tanggal_checkin: '2025-05-04T09:30:00',
            klien: 'Ahmad Subarjo',
            nama_hewan: 'Fluffy',
            nomor_antri: 1,
            status: 'menunggu',
            tanggal_edit: '2025-05-04T09:30:00'
        },
        {
            _id: '2',
            tanggal_checkin: '2025-05-04T10:15:00',
            klien: 'Budi Santoso',
            nama_hewan: 'Rex',
            nomor_antri: 2,
            status: 'diperiksa',
            tanggal_edit: '2025-05-04T10:15:00'
        },
        {
            _id: '3',
            tanggal_checkin: '2025-05-04T10:45:00',
            klien: 'Siti Aminah',
            nama_hewan: 'Kitty',
            nomor_antri: 3,
            status: 'selesai',
            tanggal_edit: '2025-05-04T11:30:00'
        },
        {
            _id: '4',
            tanggal_checkin: '2025-05-04T11:00:00',
            klien: 'Darmawan',
            nama_hewan: 'Bolt',
            nomor_antri: 4,
            status: 'dibatalkan',
            tanggal_edit: '2025-05-04T11:05:00'
        },
        {
            _id: '5',
            tanggal_checkin: '2025-05-04T13:30:00',
            klien: 'Rina Marlina',
            nama_hewan: 'Whiskers',
            nomor_antri: 5,
            status: 'menunggu',
            tanggal_edit: '2025-05-04T13:30:00'
        }
    ];

    const fetchAllKunjungan = async () => {
        setIsLoading(true);
        try {
            // Simulasi API call dengan dummy data
            setTimeout(() => {
                setKunjungan(dummyData);
                setFilteredKunjungan(dummyData);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Gagal fetch data kunjungan:', error);
            showErrorMessage("Gagal memuat data kunjungan: " + (error.response?.data?.message || error.message));
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllKunjungan();
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = kunjungan.filter((item) => {
            const allFields = `
                ${item.nama_hewan || ""}
                ${item.klien || ""}
                ${item.nomor_antri || ""}
                ${item.status || ""}
                ${new Date(item.tanggal_checkin).toLocaleString()}
                ${new Date(item.tanggal_edit).toLocaleString()}
            `.toLowerCase();
            return allFields.includes(lower);
        });

        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "tanggal_checkin" || sortBy === "tanggal_edit") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "nama_hewan" || sortBy === "klien" || sortBy === "status") {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                } else {
                    valueA = a[sortBy];
                    valueB = b[sortBy];
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredKunjungan(result);
    }, [searchTerm, kunjungan, sortBy, sortOrder]);

    // Check if user has permission
    const hasEditPermission = () => {
        if (!currentUser) return false;
        return ['superadmin', 'administrasi', 'dokter'].includes(currentUser.aktor);
    };

    const handleEdit = (kunjunganItem) => {
        // Check if user has permission to edit
        if (!hasEditPermission()) {
            showErrorMessage("Anda tidak memiliki izin untuk mengedit kunjungan. Hanya Administrasi, Dokter, dan Superadmin yang diizinkan.");
            return;
        }
        
        // Implement the edit functionality here
        alert(`Edit kunjungan untuk ${kunjunganItem.nama_hewan}`);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "menunggu":
                return "status-kuning";
            case "diperiksa":
                return "status-biru";
            case "selesai":
                return "status-hijau";
            case "dibatalkan":
                return "status-merah";
            default:
                return "";
        }
    };

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
                                <th>Nomor Antri</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKunjungan.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">Tidak ada data kunjungan</td>
                                </tr>
                            ) : (
                                filteredKunjungan.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(item.tanggal_checkin).toLocaleString()}</td>
                                        <td>{item.klien}</td>
                                        <td>{item.nama_hewan}</td>
                                        <td>{item.nomor_antri}</td>
                                        <td>
                                            <span className={`status-label ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="riwayat-actions">
                                            <button 
                                                className={`btn-green ${!hasEditPermission() ? 'disabled-button' : ''}`} 
                                                title="Edit" 
                                                onClick={() => handleEdit(item)}
                                            >
                                                <img src={editIcon} alt="edit" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Kunjungan;