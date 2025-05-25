import React, { useState, useEffect, useRef } from 'react';
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
        type: "error"
    });

    // State for auto-refresh
    const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);
    const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
    const intervalRef = useRef(null);

    // Show notification function
    const showNotification = (message, type = "error") => {
        setNotification({
            show: true,
            message: message,
            type: type
        });
        
        // Hapus notifikasi setelah 3 detik
        setTimeout(() => {
            setNotification(prev => ({
                ...prev,
                show: false
            }));
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

    // Setup auto-refresh interval
    useEffect(() => {
        // Initial data fetch
        fetchPembayaranData();

        // Setup auto-refresh if active
        if (isAutoRefreshActive) {
            intervalRef.current = setInterval(() => {
                fetchPembayaranData(true); // Pass true to indicate auto-refresh
            }, 3000); // Refresh every 3 seconds
        }

        // Cleanup interval on unmount or when auto-refresh is disabled
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAutoRefreshActive]);
    
    // Update filtered data when source data or filters change
    useEffect(() => {
        filterAndSortData();
    }, [pembayaranList, searchTerm, sortBy, sortOrder]);

    // Fetch all payment data
    const fetchPembayaranData = async (isAutoRefresh = false) => {
        try {
            // Only show loading indicator for manual refresh, not auto-refresh
            if (!isAutoRefresh) {
                setLoading(true);
            }
            
            const data = await getAllPembayaran();
            
            // Check if data has changed (for notification purposes)
            if (isAutoRefresh && pembayaranList.length > 0) {
                const newPendingPayments = data.filter(item => 
                    item.status_retribusi.toLowerCase() === "menunggu pembayaran"
                );
                const currentPendingPayments = pembayaranList.filter(item => 
                    item.status_retribusi.toLowerCase() === "menunggu pembayaran"
                );
                
                // Check if there are new pending payments
                if (newPendingPayments.length > currentPendingPayments.length) {
                    showNotification(`${newPendingPayments.length - currentPendingPayments.length} data pembayaran baru ditemukan`, "info");
                }
            }
            
            setPembayaranList(data);
            setLastRefreshTime(new Date());
            
            if (!isAutoRefresh) {
                setLoading(false);
            }
        } catch (err) {
            setError('Gagal mengambil data pembayaran');
            if (!isAutoRefresh) {
                setLoading(false);
            }
            console.error('Error fetching payment data:', err);
            
            // Show error notification only for manual refresh
            if (!isAutoRefresh) {
                showNotification('Gagal mengambil data pembayaran', "error");
            }
        }
    };

    // Manual refresh function
    const handleManualRefresh = () => {
        fetchPembayaranData();
        showNotification("Data berhasil diperbarui", "success");
    };

    // Toggle auto-refresh
    const toggleAutoRefresh = () => {
        setIsAutoRefreshActive(!isAutoRefreshActive);
        
        if (!isAutoRefreshActive) {
            // Starting auto-refresh
            showNotification("Auto-refresh diaktifkan", "info");
        } else {
            // Stopping auto-refresh
            showNotification("Auto-refresh dinonaktifkan", "warning");
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
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

    // Format time for display
    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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

            {/* Auto-refresh controls */}
            {/* <div className="refresh-controls" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '5px',
                fontSize: '14px'
            }}>
                <button 
                    className={`refresh-toggle-btn ${isAutoRefreshActive ? 'active' : 'inactive'}`}
                    onClick={toggleAutoRefresh}
                    style={{
                        padding: '5px 10px',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        backgroundColor: isAutoRefreshActive ? '#4CAF50' : '#f44336',
                        color: 'white',
                        fontSize: '12px'
                    }}
                >
                    {isAutoRefreshActive ? '🔄 Auto-Refresh ON' : '⏸ Auto-Refresh OFF'}
                </button>
                
                <button 
                    className="manual-refresh-btn"
                    onClick={handleManualRefresh}
                    style={{
                        padding: '5px 10px',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        fontSize: '12px'
                    }}
                >
                    🔄 Refresh Manual
                </button>
                
                <span style={{ color: '#666', fontSize: '12px' }}>
                    Last update: {formatTime(lastRefreshTime)}
                </span>
                
                {isAutoRefreshActive && (
                    <span style={{ 
                        color: '#4CAF50', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        • Auto-refresh aktif (setiap 3 detik)
                    </span>
                )}
            </div> */}
            
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