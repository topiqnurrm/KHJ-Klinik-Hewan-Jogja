import React, { useState, useEffect } from 'react';
import './kasir.css';
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import { getAllPembayaran, hasEditPermission, getCurrentUser } from '../../../../api/api-aktivitas-kasir';
import EditRetribusi from './editRetribusi';

const Kasir = () => {
    // States for data and UI control
    const [pembayaranList, setPembayaranList] = useState([]);
    const [filteredPembayaranList, setFilteredPembayaranList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("tanggal_raw");
    const [sortOrder, setSortOrder] = useState("desc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for edit functionality
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPembayaran, setEditingPembayaran] = useState(null);
    
    // State for current user and permissions
    const [currentUser, setCurrentUser] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    
    // State for notifications
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "error" // error, success, warning, info
    });

    // Show notification function
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
    
    // Fetch user data and permissions on mount
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Set permission flag
        setCanEdit(hasEditPermission());
        
        // If no user or invalid permissions, show error
        if (!user) {
            showNotification("Silakan login untuk mengakses halaman ini", "error");
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchPembayaranData();
    }, []);
    
    // Update filtered data when source data or filters change
    useEffect(() => {
        filterAndSortData();
    }, [pembayaranList, searchTerm, sortBy, sortOrder]);

    // Fetch all payment data
    const fetchPembayaranData = async () => {
        try {
            setLoading(true);
            const data = await getAllPembayaran();
            setPembayaranList(data);
            setFilteredPembayaranList(data.filter(item => 
                item.status_retribusi.toLowerCase() === "menunggu pembayaran"
            ));
            setLoading(false);
        } catch (err) {
            setError('Gagal mengambil data pembayaran');
            setLoading(false);
            console.error('Error fetching payment data:', err);
        }
    };

    // Filter and sort data based on current criteria
    const filterAndSortData = () => {
        let filtered = [...pembayaranList];
        
        // Filter hanya status "menunggu pembayaran"
        filtered = filtered.filter(item => 
            item.status_retribusi.toLowerCase() === "menunggu pembayaran"
        );
        
        // Apply search filter if exists
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.nama_klien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.nama_hewan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.nomor_antri.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.total_tagihan.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'tanggal_raw') {
                return sortOrder === 'asc' 
                    ? new Date(a.tanggal_raw) - new Date(b.tanggal_raw)
                    : new Date(b.tanggal_raw) - new Date(a.tanggal_raw);
            }
            
            if (sortBy === 'total_tagihan') {
                return sortOrder === 'asc'
                    ? parseFloat(a.total_tagihan) - parseFloat(b.total_tagihan)
                    : parseFloat(b.total_tagihan) - parseFloat(a.total_tagihan);
            }
            
            // For text-based sorting
            const aValue = (a[sortBy] || '').toString().toLowerCase();
            const bValue = (b[sortBy] || '').toString().toLowerCase();
            
            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        setFilteredPembayaranList(filtered);
    };

    // Handle edit button click
    const handleEdit = (pembayaranItem) => {
        setEditingPembayaran(pembayaranItem);
        setShowEditModal(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingPembayaran(null);
    };

    // Update data after edit
    const handleUpdateAfterEdit = () => {
        fetchPembayaranData(); // Refresh data
        showNotification("Data pembayaran berhasil diperbarui", "success");
    };

    // Get CSS class for status display
    const getStatusClass = (status) => {
        switch (status) {
            case "menunggu pembayaran":
                return "status-kuning";
            case "mengambil obat":
                return "status-biru";
            case "selesai":
                return "status-hijau";
            default:
                return "";
        }
    };

    // Format currency (IDR)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
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

    return (
        <div className='kasir-container'>
            <div className="dashboard-header">
                <h1>Aktivitas &gt; Kasir</h1>
            </div>
            
            {/* Notification system */}
            {notification.show && (
                <div className={getNotificationClass()}>
                    {notification.message}
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
                        <option value="tanggal_raw">Tanggal Selesai</option>
                        <option value="nama_klien">Nama Klien</option>
                        <option value="nama_hewan">Nama Hewan</option>
                        <option value="nomor_antri">Nomor Antri</option>
                        <option value="total_tagihan">Total Tagihan</option>
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
                {loading ? (
                    <div className="loading-indicator">Memuat data...</div>
                ) : (
                    <table className="riwayat-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal Selesai Periksa</th>
                                <th>Nama Klien</th>
                                <th>Nama Hewan</th>
                                <th>Nomor Antri</th>
                                <th>Total Tagihan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPembayaranList.length > 0 ? (
                                filteredPembayaranList.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{item.tanggal_selesai}</td>
                                        <td>{item.nama_klien}</td>
                                        <td>{item.nama_hewan}</td>
                                        <td>{item.nomor_antri}</td>
                                        <td>{formatCurrency(item.total_tagihan)}</td>
                                        <td>
                                            <span className="status-label status-kuning">
                                                {item.status_retribusi}
                                            </span>
                                        </td>
                                        <td className="riwayat-actions">
                                            <button 
                                                className={`btn-blue ${!canEdit ? 'disabled-button' : ''}`}
                                                title="Edit" 
                                                onClick={() => {
                                                    if (!canEdit) {
                                                        showNotification("Anda tidak memiliki izin untuk mengedit pembayaran. Hanya kasir dan Superadmin yang diizinkan.", "error");
                                                    } else {
                                                        handleEdit(item);
                                                    }
                                                }}
                                            >
                                                <img src={editIcon} alt="edit" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">Tidak ada data pembayaran yang menunggu pembayaran</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Edit Pembayaran Modal */}
                {showEditModal && editingPembayaran && (
                    <EditRetribusi 
                        pembayaranItem={editingPembayaran}
                        onClose={closeEditModal}
                        onUpdate={handleUpdateAfterEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default Kasir;