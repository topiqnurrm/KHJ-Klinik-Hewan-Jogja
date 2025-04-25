import React, { useEffect, useState } from "react";
import Popup from "../popup/popupriwayat";
import ConfirmPopup from "../popup/popup2"; 
import PopupEditBooking from "../popup/popupeditbooking";
import { getBookingWithRetribusi, deleteBooking } from "../../api/api-booking";
import "./riwayatklien.css";

// Import ikon tombol
import retribusiIcon from "./gambar/retribusi.png";
import rekamIcon from "./gambar/rekam.png";
import editIcon from "./gambar/edit.png";
import hapusIcon from "./gambar/hapus.png";

const formatRupiah = (value) => {
    if (!value) return "Rp0";
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
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    
    // Add new state for edit popup
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [bookingToEdit, setBookingToEdit] = useState(null);

    const fetchRiwayat = () => {
        setIsLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?._id;

        if (!userId) {
            setIsLoading(false);
            return;
        }

        getBookingWithRetribusi()
            .then((data) => {
                const filteredByUser = data.filter(
                    (item) => item.id_pasien?.id_user === userId
                );
                setRiwayat(filteredByUser);
                setFiltered(filteredByUser);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setSortBy("");
            setSortOrder("asc");
            fetchRiwayat();
        }
    }, [isOpen]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = riwayat.filter((r) => {
            const grandTotalStr = formatRupiah(r.grand_total);
            const layananStr = (r.pelayanans1 || [])
                .map((p) => p.id_pelayanan?.nama)
                .filter(Boolean)
                .join(", ");
            const allFields = `
                ${r.id_pasien?.nama || ""}
                ${r.keluhan || ""}
                ${r.status_booking || ""}
                ${r.administrasis1?.[0]?.catatan || ""}
                ${new Date(r.createdAt).toLocaleString()}
                ${new Date(r.updatedAt).toLocaleString()}
                ${grandTotalStr}
                ${layananStr}
                ${new Date(r.pilih_tanggal).toLocaleDateString("id-ID")}
            `.toLowerCase();

            return allFields.includes(lower);
        });

        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "pilih_tanggal") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "nama_hewan") {
                    valueA = a.id_pasien?.nama?.toLowerCase() || "";
                    valueB = b.id_pasien?.nama?.toLowerCase() || "";
                } else if (sortBy === "biaya") {
                    const aVal = a.grand_total?.$numberDecimal ?? a.grand_total ?? 0;
                    const bVal = b.grand_total?.$numberDecimal ?? b.grand_total ?? 0;
                    valueA = parseFloat(aVal);
                    valueB = parseFloat(bVal);
                }

                if (sortOrder === "asc") return valueA > valueB ? 1 : -1;
                return valueA < valueB ? 1 : -1;
            });
        }

        setFiltered(result);
    }, [searchTerm, riwayat, sortBy, sortOrder]);

    // Handle delete booking
    const handleDelete = (booking) => {
        setBookingToDelete(booking);
        setShowConfirmPopup(true);
    };

    // Handle edit booking
    const handleEdit = (booking) => {
        setBookingToEdit(booking);
        setShowEditPopup(true);
    };

    // Handle closing the edit popup
    const handleCloseEditPopup = () => {
        setShowEditPopup(false);
        setBookingToEdit(null);
        // Refresh the booking list after edit
        fetchRiwayat();
        
        // Notify parent about the change
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
                // Update the state by removing the deleted booking
                const updatedRiwayat = riwayat.filter(r => r._id !== bookingToDelete._id);
                setRiwayat(updatedRiwayat);
                setFiltered(updatedRiwayat);
                setBookingToDelete(null);
                setIsLoading(false);
                
                // Call the callback to notify parent components
                if (typeof onBookingDeleted === 'function') {
                    onBookingDeleted();
                }
                // alert("Booking berhasil dihapus!");
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

    // Fungsi untuk menentukan apakah tombol retribusi bisa diakses
    const canAccessRetribusi = (status) => {
        return ["mengambil obat", "selesai"].includes(status);
    };

    // Fungsi untuk menentukan apakah tombol rekam medis bisa diakses
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

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title="Riwayat Pemeriksaan">
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
                            <button className="riwayat-clear-button" onClick={() => setSearchTerm("")}>
                                X
                            </button>
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
                                    <th>Biaya</th>
                                    <th>Catatan</th>
                                    <th>Layanan</th>
                                    <th>Status</th>
                                    <th>Tgl Update</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="no-data">Tidak ada data booking</td>
                                    </tr>
                                ) : (
                                    filtered.map((r, index) => (
                                        <tr key={r._id}>
                                            <td>{index + 1}</td>
                                            <td>{new Date(r.createdAt).toLocaleString()}</td>
                                            <td>{new Date(r.pilih_tanggal).toLocaleDateString("id-ID")}</td>
                                            <td>{r.id_pasien?.nama || "Tidak diketahui"}</td>
                                            <td>{r.keluhan}</td>
                                            <td>{formatRupiah(r.grand_total)}</td>
                                            <td>{r.administrasis1?.[0]?.catatan || "-"}</td>
                                            <td>
                                                {(r.pelayanans1 || [])
                                                    .map((p) => p.id_pelayanan?.nama)
                                                    .filter(Boolean)
                                                    .join(", ") || "-"}
                                            </td>
                                            {/* <td>{r.status_booking}</td> */}
                                            <td>
                                                <span className={`status-label ${getStatusClass(r.status_booking)}`}>
                                                    {r.status_booking}
                                                </span>
                                            </td>

                                            <td>{new Date(r.updatedAt).toLocaleString()}</td>
                                            <td className="riwayat-actions">
                                                {[
                                                    "sedang diperiksa",
                                                    "dirawat inap",
                                                    "menunggu pembayaran",
                                                    "mengambil obat",
                                                    "selesai",
                                                ].includes(r.status_booking) && (
                                                    <>
                                                    <button 
                                                        className={`btn-blue ${canAccessRetribusi(r.status_booking) ? '' : 'disabled'}`} 
                                                        title="Lihat Retribusi" 
                                                        onClick={() => canAccessRetribusi(r.status_booking) && alert(`Lihat retribusi ${r._id}`)}
                                                        disabled={!canAccessRetribusi(r.status_booking)}
                                                    >
                                                        <img src={retribusiIcon} alt="retribusi" />
                                                    </button>
                                                    <button 
                                                        className={`btn-blue ${canAccessRekamMedis(r.status_booking) ? '' : 'disabled'}`} 
                                                        title="Rekam Medis" 
                                                        onClick={() => canAccessRekamMedis(r.status_booking) && alert(`Lihat rekam medis ${r._id}`)}
                                                        disabled={!canAccessRekamMedis(r.status_booking)}
                                                    >
                                                        <img src={rekamIcon} alt="rekam" />
                                                    </button>
                                                    </>
                                                )}

                                                {[
                                                    "menunggu respon administrasi",
                                                    "disetujui administrasi",
                                                    "ditolak administrasi",
                                                    "dibatalkan administrasi",
                                                ].includes(r.status_booking) && (
                                                    <>
                                                    <button 
                                                        className="btn-green" 
                                                        title="Edit" 
                                                        onClick={() => handleEdit(r)}
                                                    >
                                                        <img src={editIcon} alt="edit" />
                                                    </button>
                                                    <button 
                                                        className="btn-red" 
                                                        title="Hapus" 
                                                        onClick={() => handleDelete(r)}
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
            </Popup>

            {/* Add PopupEditBooking component */}
            <PopupEditBooking 
                isOpen={showEditPopup} 
                onClose={handleCloseEditPopup} 
                bookingData={bookingToEdit} 
            />

            {/* Use your ConfirmPopup for delete confirmation */}
            <ConfirmPopup
                isOpen={showConfirmPopup}
                onClose={cancelDelete}
                title="Konfirmasi Hapus"
                description={
                    <p>
                        Apakah Anda yakin ingin menghapus booking untuk <strong>{bookingToDelete?.id_pasien?.nama || 'hewan ini'},</strong> 
                        <br />pada booking tanggal <strong>{bookingToDelete ? new Date(bookingToDelete.pilih_tanggal).toLocaleDateString("id-ID") : ''}</strong>?
                    </p>
                }
                onConfirm={confirmDeleteBooking}
            />
        </>
    );
};

export default RiwayatPopup;