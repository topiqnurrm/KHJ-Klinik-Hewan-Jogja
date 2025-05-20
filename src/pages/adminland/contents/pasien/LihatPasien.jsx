import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom"; // Import ReactDOM for portal
import './LihatPasien.css';
import { getAllBookingByUserId, deleteBooking } from '../../../../api/api-booking';

// Import icons from riwayatklien.jsx (you'll need to adjust paths as needed)
import retribusiIcon from "../../../../components/riwayat/gambar/retribusi.png";
import rekamIcon from "../../../../components/riwayat/gambar/rekam.png";
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import hapusIcon from "../../../../components/riwayat/gambar/hapus.png";

// Import popup components
import PopupEditBooking from '../dashboard/popup/popupeditbooking.jsx';
import Popup from '../../admin_nav/popup_nav/popup2.jsx';

import MedicalRecordPopup from '../../../../components/print_historis/MedicalRecordPopup.jsx';

const LihatPasien = ({ pasien, onClose, users, getKategoriClass }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
    
    // States for handling edit and delete functionality
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    // Tambahkan state untuk MedicalRecordPopup
    const [isMedicalRecordOpen, setIsMedicalRecordOpen] = useState(false);
    const [selectedMedicalBookingId, setSelectedMedicalBookingId] = useState(null);
    
    // Fungsi untuk membuka MedicalRecordPopup
    const handleOpenMedicalRecord = (bookingId) => {
        setSelectedMedicalBookingId(bookingId);
        setIsMedicalRecordOpen(true);
    };
    
    // Fungsi untuk menutup MedicalRecordPopup
    const handleCloseMedicalRecord = () => {
        setIsMedicalRecordOpen(false);
        setSelectedMedicalBookingId(null);
    };
    
    // Format currency to Rupiah
    const formatRupiah = (value) => {
        if (!value) return "Rp0";
        const amount = typeof value === "object" && value.$numberDecimal
            ? parseFloat(value.$numberDecimal)
            : typeof value === "string"
            ? parseFloat(value)
            : value;
        return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    };

    // Format service display with proper formatting
    const formatServiceDisplay = (pelayanan, defaultJenisLayanan) => {
        const nama = pelayanan.nama || pelayanan.id_pelayanan?.nama || "";
        const jenisLayanan = pelayanan.jenis_layanan || pelayanan.id_pelayanan?.jenis_layanan || defaultJenisLayanan || "";
        const formattedJenisLayanan = jenisLayanan.charAt(0).toUpperCase() + jenisLayanan.slice(1);
        return jenisLayanan ? `${nama} (${formattedJenisLayanan})` : nama;
    };

    // Status styling class
    const getStatusClass = (status) => {
        switch (status) {
            case "menunggu respon administrasi":
            case "sedang diperiksa":
            case "dirawat inap":
            case "menunggu pembayaran":
            case "mengambil obat":
                return "status-kuning";
            case "disetujui administrasi":
                return "status-hijau";
            case "ditolak administrasi":
            case "dibatalkan administrasi":
                return "status-merah";
            case "selesai":
                return "status-biru";
            default:
                return "";
        }
    };

    // Permission checks for actions
    const canAccessRetribusi = (status) => {
        return ["mengambil obat", "selesai"].includes(status);
    };

    const canAccessRekamMedis = (status) => {
        // return ["dirawat inap", "menunggu pembayaran", "mengambil obat", "selesai"].includes(status);
        return true;
    };

    // Toggle details section
    const toggleDetails = () => {
        setIsDetailsCollapsed(!isDetailsCollapsed);
    };

    // Function to fetch bookings
    const fetchBookings = () => {
        if (pasien && pasien._id) {
            setIsLoading(true);
            getAllBookingByUserId(pasien._id)
                .then(data => {
                    setBookings(data);
                    setFilteredBookings(data);
                })
                .catch(error => {
                    console.error("Error fetching bookings:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    // Fetch bookings when pasien changes
    useEffect(() => {
        fetchBookings();
    }, [pasien]);

    // Apply search and sort
    useEffect(() => {
        if (!bookings.length) return;
        
        let result = [...bookings];
        
        // Apply search if there's a search term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(booking => {
                const biayaStr = formatRupiah(booking.biaya);
                const layananStr = (booking.pelayanans1 || [])
                    .map(p => formatServiceDisplay(p, booking.jenis_layanan))
                    .filter(Boolean)
                    .join(", ");
                const allFields = `
                    ${booking.keluhan || ""}
                    ${booking.status_booking || ""}
                    ${booking.jenis_layanan || ""}
                    ${layananStr}
                    ${new Date(booking.pilih_tanggal).toLocaleDateString("id-ID")}
                    ${new Date(booking.updatedAt).toLocaleString()}
                    ${biayaStr}
                `.toLowerCase();
                return allFields.includes(lower);
            });
        }
        
        // Apply sort if there's a sort field
        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "pilih_tanggal" || sortBy === "updatedAt") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "biaya") {
                    const aVal = a.biaya?.$numberDecimal ?? a.biaya ?? 0;
                    const bVal = b.biaya?.$numberDecimal ?? b.biaya ?? 0;
                    valueA = parseFloat(aVal);
                    valueB = parseFloat(bVal);
                } else {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }
        
        setFilteredBookings(result);
    }, [bookings, searchTerm, sortBy, sortOrder]);

    // Handle edit function
    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setIsEditPopupOpen(true);
    };

    const handleEditClose = (wasUpdated = false) => {
        setIsEditPopupOpen(false);
        setSelectedBooking(null);
        
        // If booking was updated, refresh the data
        if (wasUpdated) {
            fetchBookings();
        }
    };

    // Handle delete function
    const handleDeleteRequest = (booking) => {
        setBookingToDelete(booking);
        setIsDeletePopupOpen(true);
    };

    // Add this to your component
    const handleOutsideClick = (e) => {
        // If the click is on the overlay itself (not its children)
        if (e.target.className === 'detail-popup-overlay-pasien') {
            onClose();
        }
    };

    const handleConfirmDelete = () => {
        if (!bookingToDelete) return;
        
        setIsLoading(true);
        deleteBooking(bookingToDelete._id)
            .then(() => {
                // Refresh the booking list after deletion
                fetchBookings();
                setIsDeletePopupOpen(false);
                setBookingToDelete(null);
            })
            .catch((error) => {
                console.error("Failed to delete booking:", error);
                alert("Failed to delete booking: " + (error.response?.data?.message || error.message));
                setIsDeletePopupOpen(false);
                setBookingToDelete(null);
                setIsLoading(false);
            });
    };

    if (!pasien) return null;

    // Create the modal content
    const modalContent = (
        <div className="detail-popup-overlay-pasien" onClick={handleOutsideClick}>
            <div className="detail-popup">
                <div className="detail-header">
                    <h2>Riwayat Pemeriksaan Pasien : {pasien.nama}</h2>
                    <div className="header-actions">
                        <button className="close-button-x" onClick={onClose}>×</button>
                    </div>
                </div>
                
                {/* Uncomment if you want to show the pet details section */}
                {/* <div className="detail-info-container">
                    <div className="detail-info-header" onClick={toggleDetails}>
                        <h3>Informasi Hewan</h3>
                        <span className={`collapse-icon ${isDetailsCollapsed ? 'collapsed' : ''}`}>
                            {isDetailsCollapsed ? '▼' : '▲'}
                        </span>
                    </div>
                    
                    {!isDetailsCollapsed && (
                        <div className="detail-info">
                            <div className="info-row">
                                <div className="info-item">
                                    <span className="info-label">Jenis:</span>
                                    <span className="info-value">{pasien.jenis || "-"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Ras:</span>
                                    <span className="info-value">{pasien.ras || "-"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Umur:</span>
                                    <span className="info-value">{pasien.umur ? `${pasien.umur} bulan` : "-"}</span>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <span className="info-label">Kategori:</span>
                                    <span className={`info-value status-label ${getKategoriClass(pasien.kategori)}`}>
                                        {pasien.kategori || "-"}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Jenis Kelamin:</span>
                                    <span className="info-value">{pasien.jenis_kelamin || "-"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Pemilik:</span>
                                    <span className="info-value">{users[pasien.id_user]?.nama || "-"}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div> */}
                
                <div className="booking-history">
                    <div className="riwayat-filter-container">
                        <div className="riwayat-search-wrapper">
                            <label className="riwayat-search-label">Filter Pencarian</label>
                            <input
                                type="text"
                                className="riwayat-search-input"
                                placeholder="Cari data booking..."
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
                                <option value="pilih_tanggal">Tanggal Booking</option>
                                <option value="status_booking">Status</option>
                                <option value="jenis_layanan">Jenis Layanan</option>
                                <option value="updatedAt">Tanggal Update</option>
                                <option value="biaya">Biaya</option>
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
                
                    <div className="detail-content">
                        {isLoading ? (
                            <div className="loading-indicator">Memuat data booking...</div>
                        ) : (
                            <table className="riwayat-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tgl Booking</th>
                                        <th>Keluhan</th>
                                        <th>Layanan</th>
                                        <th>Jenis Layanan</th>
                                        <th>Status</th>
                                        <th>Tgl Update</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="no-data">Tidak ada data booking untuk pasien ini</td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((booking, index) => (
                                            <tr key={booking._id}>
                                                <td>{index + 1}</td>
                                                <td>{new Date(booking.pilih_tanggal).toLocaleDateString("id-ID")}</td>
                                                <td>{booking.keluhan || "-"}</td>
                                                <td>
                                                    {(booking.pelayanans1 || [])
                                                        .map(p => formatServiceDisplay(p, booking.jenis_layanan))
                                                        .filter(Boolean)
                                                        .join(", ") || "-"}
                                                </td>
                                                <td>{booking.jenis_layanan || "-"}</td>
                                                <td>
                                                    <span className={`status-label ${getStatusClass(booking.status_booking)}`}>
                                                        {booking.status_booking}
                                                    </span>
                                                </td>
                                                <td>{new Date(booking.updatedAt).toLocaleString()}</td>
                                                <td className="riwayat-actions">
                                                    {["sedang diperiksa", "dirawat inap", "menunggu pembayaran", "mengambil obat", "selesai"].includes(booking.status_booking) && (
                                                        <>
                                                            {/* <button 
                                                                className={`btn-blue ${canAccessRetribusi(booking.status_booking) ? '' : 'disabled'}`} 
                                                                title="Lihat Retribusi" 
                                                                onClick={() => canAccessRetribusi(booking.status_booking) && alert(`Lihat retribusi ${booking._id}`)}
                                                                disabled={!canAccessRetribusi(booking.status_booking)}
                                                            >
                                                                <img src={retribusiIcon} alt="retribusi" />
                                                            </button> */}
                                                            {/* <button 
                                                                className={`btn-blue ${canAccessRekamMedis(booking.status_booking) ? '' : 'disabled'}`} 
                                                                title="Rekam Medis" 
                                                                onClick={() => canAccessRekamMedis(booking.status_booking) && alert(`Lihat rekam medis ${booking._id}`)}
                                                                disabled={!canAccessRekamMedis(booking.status_booking)}
                                                            >
                                                                <img src={rekamIcon} alt="rekam" />
                                                            </button> */}
                                                            <button 
                                                                className="btn-blue" // Remove the conditional class
                                                                title="Rekam Medis" 
                                                                onClick={() => handleOpenMedicalRecord(booking._id)} // Remove the condition check
                                                            >
                                                                <img src={rekamIcon} alt="rekam" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {["menunggu respon administrasi", "disetujui administrasi", "ditolak administrasi", "dibatalkan administrasi"].includes(booking.status_booking) && (
                                                        <>
                                                            <button 
                                                                className="btn-green" 
                                                                title="Edit" 
                                                                onClick={() => handleEdit(booking)}
                                                            >
                                                                <img src={editIcon} alt="edit" />
                                                            </button>
                                                            <button 
                                                                className="btn-red" 
                                                                title="Hapus" 
                                                                onClick={() => handleDeleteRequest(booking)}
                                                                disabled={isLoading}
                                                            >
                                                                <img src={hapusIcon} alt="hapus" />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Use ReactDOM.createPortal to render at the body level
    return (
        <>
            {ReactDOM.createPortal(modalContent, document.body)}
            
            {/* Popups - Also need to be portals */}
            {isEditPopupOpen && <PopupEditBooking 
                isOpen={isEditPopupOpen} 
                onClose={handleEditClose} 
                bookingData={selectedBooking} 
            />}

            <Popup
                isOpen={isDeletePopupOpen}
                onClose={() => setIsDeletePopupOpen(false)}
                title="Konfirmasi Hapus"
                description={`Apakah Anda yakin ingin menghapus booking untuk ${pasien.nama}?`}
                onConfirm={handleConfirmDelete}
            />

            {/* Tambahkan MedicalRecordPopup di sini */}
            <MedicalRecordPopup
                isOpen={isMedicalRecordOpen}
                onClose={handleCloseMedicalRecord}
                bookingId={selectedMedicalBookingId}
            />
        </>
    );
};

export default LihatPasien;