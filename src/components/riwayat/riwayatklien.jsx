import React, { useEffect, useState, useRef } from "react";
import Popup from "../popup/popupriwayat";
import ConfirmPopup from "../popup/popup2"; 
import PopupEditBooking from "../popup/popupeditbooking";
import MedicalRecordPopup from "../print_historis/MedicalRecordPopup"; // Import the MedicalRecordPopup component
import { getBookingWithRetribusi, deleteBooking } from "../../api/api-booking";
import "./riwayatklien.css";

import retribusiIcon from "./gambar/retribusi.png";
import rekamIcon from "./gambar/rekam.png";
import editIcon from "./gambar/edit.png";
import hapusIcon from "./gambar/hapus.png";

const formatRupiah = (value) => {
    if (!value) return "Rp -";
    const amount = typeof value === "object" && value.$numberDecimal
        ? parseFloat(value.$numberDecimal)
        : typeof value === "string"
        ? parseFloat(value)
        : value;
    return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

const RiwayatPopup = ({ isOpen, onClose, onBookingDeleted }) => {
    const [riwayat, setRiwayat] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [bookingToEdit, setBookingToEdit] = useState(null);
    // New state for medical record popup
    const [showMedicalRecordPopup, setShowMedicalRecordPopup] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    // Auto-update states
    const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
    const intervalRef = useRef(null);

    const fetchRiwayat = (silent = false) => {
        if (!silent) setIsLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?._id;

        if (!userId) {
            if (!silent) setIsLoading(false);
            return;
        }

        getBookingWithRetribusi()
            .then((data) => {
                const filteredByUser = data.filter(
                    (item) => item.administrasis1?.some(admin => admin.id_user === userId)
                );
                
                if (filteredByUser.length > 0) {
                    const sampleItem = filteredByUser[0];
                    console.log("Sample administrasis1:", sampleItem.administrasis1);
                    setDebugInfo({
                        itemId: sampleItem._id,
                        administrasis1: sampleItem.administrasis1,
                        latestNote: getLatestNote(sampleItem.administrasis1)
                    });
                }
                
                setRiwayat(filteredByUser);
                setFiltered(filteredByUser);
                setLastUpdateTime(new Date());
                if (!silent) setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                if (!silent) setIsLoading(false);
            });
    };

    // Setup auto-update interval
    useEffect(() => {
        if (isOpen && isAutoUpdateEnabled) {
            // Clear existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            
            // Set up new interval for auto-update every 3 seconds
            intervalRef.current = setInterval(() => {
                fetchRiwayat(true); // Silent update (tidak menampilkan loading)
            }, 3000);

            // Cleanup function
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isOpen, isAutoUpdateEnabled]);

    // Initial fetch when popup opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setSortBy("");
            setSortOrder("asc");
            fetchRiwayat();
        }
    }, [isOpen]);

    // Cleanup interval when component unmounts or popup closes
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Clear interval when popup closes
    useEffect(() => {
        if (!isOpen && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [isOpen]);

    const getLatestNote = (administrasisArray) => {
        console.log("Receiving administrasisArray:", administrasisArray);
        
        if (!administrasisArray || !Array.isArray(administrasisArray) || administrasisArray.length === 0) {
            console.log("Array kosong atau tidak valid, mengembalikan default");
            return { catatan: "-", status_administrasi: "", tanggal: null };
        }

        let adminCopy = [...administrasisArray];

        console.log("Tanggal sebelum sorting:", adminCopy.map(a => ({
            tanggal: a.tanggal,
            catatan: a.catatan,
            createdAt: a.createdAt,
            parsed: a.createdAt ? new Date(a.createdAt) : new Date(a.tanggal)
        })));

        adminCopy.sort((a, b) => {
            const dateFieldA = a.createdAt || a.tanggal;
            const dateFieldB = b.createdAt || b.tanggal;
            
            if (!dateFieldA) return 1;
            if (!dateFieldB) return -1;
            
            const dateA = new Date(dateFieldA);
            const dateB = new Date(dateFieldB);
            
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            
            return dateB - dateA;
        });

        console.log("Hasil setelah sorting:", adminCopy.map(a => ({
            tanggal: a.tanggal,
            createdAt: a.createdAt,
            catatan: a.catatan
        })));

        const newest = adminCopy[0];
        console.log("Catatan terbaru yang dipilih:", newest);
        return newest;
    };
    
    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = riwayat.filter((r) => {
            const biayaStr = formatRupiah(r.biaya);
            const layananStr = (r.pelayanans1 || [])
                .map(p => formatServiceDisplay(p, r.jenis_layanan))
                .filter(Boolean)
                .join(", ");
            
            const latestNote = getLatestNote(r.administrasis1);
            console.log(`Item ${r._id} - Latest note:`, latestNote);
            
            const allFields = `
                ${r.nama || r.id_pasien?.nama || ""}
                ${r.keluhan || ""}
                ${r.status_booking || ""}
                ${latestNote?.catatan || "-"}
                ${latestNote?.status_administrasi || ""}
                ${new Date(r.createdAt).toLocaleString()}
                ${new Date(r.updatedAt).toLocaleString()}
                ${biayaStr}
                ${layananStr}
                ${new Date(r.pilih_tanggal).toLocaleDateString("id-ID")}
            `.toLowerCase();
            return allFields.includes(lower);
        });

        if (sortBy) {
            result.sort((a, b) => {
                let valueA, valueB;

                switch (sortBy) {
                    case "createdAt":
                    case "updatedAt":
                    case "pilih_tanggal":
                        valueA = new Date(a[sortBy]).getTime();
                        valueB = new Date(b[sortBy]).getTime();
                        break;
                    case "nama_hewan":
                        valueA = a.nama || a.id_pasien?.nama || "";
                        valueB = b.nama || b.id_pasien?.nama || "";
                        break;
                    case "biaya":
                        valueA = typeof a.biaya === "object" && a.biaya.$numberDecimal
                            ? parseFloat(a.biaya.$numberDecimal)
                            : typeof a.biaya === "string"
                            ? parseFloat(a.biaya)
                            : a.biaya || 0;
                        valueB = typeof b.biaya === "object" && b.biaya.$numberDecimal
                            ? parseFloat(b.biaya.$numberDecimal)
                            : typeof b.biaya === "string"
                            ? parseFloat(b.biaya)
                            : b.biaya || 0;
                        break;
                    default:
                        valueA = a[sortBy];
                        valueB = b[sortBy];
                }

                if (valueA === null || valueA === undefined) valueA = sortOrder === "asc" ? "" : "zzz";
                if (valueB === null || valueB === undefined) valueB = sortOrder === "asc" ? "" : "zzz";

                if (typeof valueA === "string" && typeof valueB === "string") {
                    return sortOrder === "asc"
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                } else {
                    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
                }
            });
        }

        setFiltered(result);
    }, [riwayat, searchTerm, sortBy, sortOrder]);

    const handleDelete = (booking) => {
        setBookingToDelete(booking);
        setShowConfirmPopup(true);
    };

    const handleEdit = (booking) => {
        setBookingToEdit(booking);
        setShowEditPopup(true);
    };

    // New function to handle opening medical record popup
    const handleViewMedicalRecord = (bookingId) => {
        setSelectedBookingId(bookingId);
        setShowMedicalRecordPopup(true);
    };
    
    const handleCloseMedicalRecordPopup = () => {
        setShowMedicalRecordPopup(false);
        setSelectedBookingId(null);
    };

    const handleCloseEditPopup = () => {
        setShowEditPopup(false);
        setBookingToEdit(null);
        fetchRiwayat();
        if (typeof onBookingDeleted === 'function') {
            onBookingDeleted();
        }
    };

    const confirmDeleteBooking = () => {
        if (!bookingToDelete) return;
        setIsLoading(true);
        setShowConfirmPopup(false);

        deleteBooking(bookingToDelete._id)
            .then(() => {
                const updatedRiwayat = riwayat.filter(r => r._id !== bookingToDelete._id);
                setRiwayat(updatedRiwayat);
                setFiltered(updatedRiwayat);
                setBookingToDelete(null);
                setIsLoading(false);
                if (typeof onBookingDeleted === 'function') {
                    onBookingDeleted();
                }
            })
            .catch((error) => {
                console.error("Gagal menghapus booking:", error);
                alert("Gagal menghapus booking: " + (error.response?.data?.message || error.message));
                setIsLoading(false);
                setBookingToDelete(null);
            });
    };

    const cancelDelete = () => {
        setShowConfirmPopup(false);
        setBookingToDelete(null);
    };

    const canAccessRetribusi = (status) => {
        return ["mengambil obat", "selesai"].includes(status);
    };

    const canAccessRekamMedis = (status) => {
        return ["dirawat inap", "menunggu pembayaran", "mengambil obat", "selesai"].includes(status);
    };

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

    const formatServiceDisplay = (pelayanan, defaultJenisLayanan) => {
        const nama = pelayanan.nama || pelayanan.id_pelayanan?.nama || "";
        const jenisLayanan = pelayanan.jenis_layanan || pelayanan.id_pelayanan?.jenis_layanan || defaultJenisLayanan || "";
        const formattedJenisLayanan = jenisLayanan.charAt(0).toUpperCase() + jenisLayanan.slice(1);
        return jenisLayanan ? `${nama} (${formattedJenisLayanan})` : nama;
    };

    // Function to toggle auto-update
    const toggleAutoUpdate = () => {
        setIsAutoUpdateEnabled(!isAutoUpdateEnabled);
    };

    // Function to manually refresh
    const handleManualRefresh = () => {
        fetchRiwayat();
    };

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title="Riwayat Pemeriksaan Hewan Saya">
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
                            <option value="createdAt">Tanggal Buat</option>
                            <option value="updatedAt">Terakhir Update</option>
                            <option value="pilih_tanggal">Tanggal Booking</option>
                            <option value="nama_hewan">Nama Hewan</option>
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

                    {/* Auto-update controls */}
                    {/* <div className="auto-update-controls">
                        <button 
                            className={`auto-update-toggle ${isAutoUpdateEnabled ? 'active' : 'inactive'}`}
                            onClick={toggleAutoUpdate}
                        >
                            {isAutoUpdateEnabled ? '⏸️ Pause Auto-Update' : '▶️ Enable Auto-Update'}
                        </button>
                        <button 
                            className="manual-refresh-btn"
                            onClick={handleManualRefresh}
                            disabled={isLoading}
                        >
                            🔄 Refresh
                        </button>
                        <div className="last-update-info">
                            <small>Update terakhir: {lastUpdateTime.toLocaleTimeString('id-ID')}</small>
                        </div>
                    </div> */}
                </div>

                <div className="riwayat-popup-content">
                    {isLoading ? (
                        <div className="loading-indicator">Memuat data...</div>
                    ) : (
                        <table className="riwayat-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tgl Buat</th>
                                    <th>Tgl Booking</th>
                                    <th>Nama Hewan</th>
                                    <th>Keluhan</th>
                                    <th>Lokasi</th>
                                    <th>Layanan</th>
                                    <th>Catatan</th>
                                    <th>Status</th>
                                    <th>Biaya</th>
                                    <th>Tgl Update</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="no-data">Tidak ada data booking</td>
                                    </tr>
                                ) : (
                                    filtered.map((r, index) => (
                                        <tr key={r._id}>
                                            <td>{index + 1}</td>
                                            <td>{new Date(r.createdAt).toLocaleString()}</td>
                                            <td>{new Date(r.pilih_tanggal).toLocaleDateString("id-ID")}</td>
                                            <td>{r.nama || r.id_pasien?.nama || "Tidak diketahui"}</td>
                                            <td>{r.keluhan}</td>
                                            <td>{r.alamat || "-"}</td>
                                            <td>
                                                {(r.pelayanans1 || [])
                                                    .map(p => formatServiceDisplay(p, r.jenis_layanan))
                                                    .filter(Boolean)
                                                    .join(", ") || "-"}
                                            </td>
                                            <td>{getLatestNote(r.administrasis1).catatan || "-"}</td>
                                            <td>
                                                <span className={`status-label ${getStatusClass(r.status_booking)}`}>
                                                    {r.status_booking}
                                                </span>
                                            </td>
                                            <td>{formatRupiah(r.biaya)}</td>
                                            <td>{new Date(r.updatedAt).toLocaleString()}</td>
                                            <td className="riwayat-actions">
                                                {["sedang diperiksa", "dirawat inap", "menunggu pembayaran", "mengambil obat", "selesai"].includes(r.status_booking) && (
                                                    <>
                                                        <button 
                                                            className="btn-blue"
                                                            title="Timeline Pemeriksaan"
                                                            onClick={() => handleViewMedicalRecord(r._id)}
                                                        >
                                                            <img src={rekamIcon} alt="rekam" />
                                                        </button>
                                                    </>
                                                )}
                                                {["menunggu respon administrasi", "disetujui administrasi", "ditolak administrasi", "dibatalkan administrasi"].includes(r.status_booking) && (
                                                    <>
                                                        <button className="btn-green" title="Edit" onClick={() => handleEdit(r)}>
                                                            <img src={editIcon} alt="edit" />
                                                        </button>
                                                        <button className="btn-red" title="Hapus" onClick={() => handleDelete(r)} disabled={isLoading}>
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
            </Popup>

            {/* Include the popups */}
            <PopupEditBooking 
                isOpen={showEditPopup} 
                onClose={handleCloseEditPopup} 
                bookingData={bookingToEdit} 
            />
            
            <ConfirmPopup
                isOpen={showConfirmPopup}
                onClose={cancelDelete}
                title="Konfirmasi Hapus"
                description={
                    <p>
                        Apakah Anda yakin ingin menghapus booking untuk <strong>{bookingToDelete?.nama || bookingToDelete?.id_pasien?.nama || 'hewan ini'}</strong>, 
                        <br />pada booking tanggal <strong>{bookingToDelete ? new Date(bookingToDelete.pilih_tanggal).toLocaleDateString("id-ID") : ''}</strong>?
                    </p>
                }
                onConfirm={confirmDeleteBooking}
            />
            
            {/* Medical Record Popup - Render conditionally outside the main popup */}
            {showMedicalRecordPopup && (
                <MedicalRecordPopup 
                    isOpen={showMedicalRecordPopup} 
                    onClose={handleCloseMedicalRecordPopup} 
                    bookingId={selectedBookingId} 
                />
            )}

            <style jsx>{`
                .all-notes {
                    max-height: 120px;
                    overflow-y: auto;
                    padding: 5px;
                    border: 1px solid #ddd;
                    background-color: #f9f9f9;
                    border-radius: 4px;
                }
                
                .note-item {
                    border-bottom: 1px solid #eee;
                    padding: 5px 0;
                }
                
                .note-item:last-child {
                    border-bottom: none;
                }
                
                .note-date {
                    font-size: 0.8em;
                    color: #666;
                    margin-bottom: 2px;
                }
                
                .note-content {
                    font-size: 0.9em;
                }
                
                .no-notes {
                    color: #999;
                    font-style: italic;
                }

                .auto-update-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                }

                .auto-update-toggle {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .auto-update-toggle.active {
                    background-color: #28a745;
                    color: white;
                }

                .auto-update-toggle.inactive {
                    background-color: #6c757d;
                    color: white;
                }

                .auto-update-toggle:hover {
                    opacity: 0.8;
                }

                .manual-refresh-btn {
                    padding: 6px 12px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: background-color 0.2s ease;
                }

                .manual-refresh-btn:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .manual-refresh-btn:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                .last-update-info {
                    margin-left: auto;
                    color: #6c757d;
                }

                .last-update-info small {
                    font-size: 11px;
                }
            `}</style>
        </>
    );
};

export default RiwayatPopup;