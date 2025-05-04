import React, { useState, useEffect } from 'react';
import './booking.css';
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import { getAllBookings, updateBookingStatus, addNoteToBooking, getCurrentUser } from '../../../../api/api-aktivitas-booking';
import EditBooking from './EditBooking';

const Booking = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("tanggal_buat");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State untuk modal edit
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    
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

    const fetchAllBookings = async () => {
        setIsLoading(true);
        try {
            const allData = await getAllBookings();
            setBookings(allData);
            setFilteredBookings(allData);
        } catch (error) {
            console.error('Gagal fetch data booking:', error);
            showErrorMessage("Gagal memuat data booking: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllBookings();
        
        // Get current user from localStorage
        const user = getCurrentUser();
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = bookings.filter((item) => {
            const allFields = `
                ${item.nama_hewan || ""}
                ${item.klien || ""}
                ${item.jenis_hewan || ""}
                ${item.jenis_layanan || ""}
                ${item.status || ""}
                ${item.catatan || ""}
                ${new Date(item.tanggal_buat).toLocaleString()}
                ${new Date(item.tanggal_booking).toLocaleString()}
                ${new Date(item.tanggal_edit).toLocaleString()}
            `.toLowerCase();
            return allFields.includes(lower);
        });

        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "tanggal_buat" || sortBy === "tanggal_edit" || sortBy === "tanggal_booking") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "nama_hewan" || sortBy === "klien" || sortBy === "jenis_hewan" || sortBy === "jenis_layanan" || sortBy === "status" || sortBy === "catatan") {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                } else {
                    valueA = a[sortBy];
                    valueB = b[sortBy];
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredBookings(result);
    }, [searchTerm, bookings, sortBy, sortOrder]);

    // Check if user has permission
    const hasEditPermission = () => {
        if (!currentUser) return false;
        return ['superadmin', 'administrasi'].includes(currentUser.aktor);
    };

    const handleEdit = (bookingItem) => {
        // Check if user has permission to edit
        if (!hasEditPermission()) {
            showErrorMessage("Anda tidak memiliki izin untuk mengedit booking. Hanya Administrasi dan Superadmin yang diizinkan.");
            return;
        }
        
        setEditingBooking(bookingItem);
        setShowEditModal(true);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "menunggu respon administrasi":
                return "status-kuning";
            case "disetujui administrasi":
                return "status-hijau";
            case "ditolak administrasi":
                return "status-merah";
            case "sedang diperiksa":
                return "status-biru";
            case "dirawat inap":
                return "status-biru";
            case "dibatalkan administrasi":
                return "status-merah";
            case "menunggu pembayaran":
                return "status-kuning";
            case "mengambil obat":
                return "status-kuning";
            case "selesai":
                return "status-hijau";
            default:
                return "";
        }
    };

    const handleUpdateBooking = (updatedBooking) => {
        // Update booking list dengan data yang sudah diupdate
        setBookings(prev => 
            prev.map(b => b._id === updatedBooking._id ? updatedBooking : b)
        );
        
        // Refresh semua data untuk memastikan konsistensi
        fetchAllBookings();
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingBooking(null);
    };

    const formatLayanan = (jenis) => {
        return jenis === 'house call' ? 'House Call' : 'Onsite';
    };

    return (
        <div className='booking-container'>
            <div className="dashboard-header">
                <h1>Aktivitas &gt; Booking</h1>
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
                        <option value="tanggal_buat">Tanggal Buat</option>
                        <option value="tanggal_edit">Tanggal Edit</option>
                        <option value="tanggal_booking">Tanggal Booking</option>
                        <option value="nama_hewan">Nama Hewan</option>
                        <option value="klien">Klien</option>
                        <option value="jenis_hewan">Jenis Hewan</option>
                        <option value="jenis_layanan">Jenis Layanan</option>
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
                                <th>Tanggal Buat</th>
                                <th>Tanggal Booking</th>
                                <th>Klien</th>
                                <th>Nama Hewan</th>
                                <th>Kategori Hewan</th>
                                <th>Jenis Layanan</th>
                                <th>Catatan</th>
                                <th>Status</th>
                                <th>Tanggal Edit</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="no-data">Tidak ada data booking</td>
                                </tr>
                            ) : (
                                filteredBookings.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(item.tanggal_buat).toLocaleString()}</td>
                                        <td>{new Date(item.tanggal_booking).toLocaleString()}</td>
                                        <td>{item.klien}</td>
                                        <td>{item.nama_hewan}</td>
                                        <td>{item.jenis_hewan}</td>
                                        <td>{formatLayanan(item.jenis_layanan)}</td>
                                        <td className="catatan-cell">{item.catatan.length > 20
                                            ? `${item.catatan.substring(0, 20)}...`
                                            : item.catatan}</td>
                                        <td>
                                            <span className={`status-label ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>{new Date(item.tanggal_edit).toLocaleString()}</td>
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

                {/* Edit Booking Component */}
                {showEditModal && editingBooking && (
                    <EditBooking 
                        booking={editingBooking} 
                        onClose={closeEditModal} 
                        onUpdate={handleUpdateBooking} 
                    />
                )}
            </div>
        </div>
    );
};

export default Booking;