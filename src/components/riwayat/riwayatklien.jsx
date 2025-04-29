import React, { useEffect, useState } from "react";
import Popup from "../popup/popupriwayat";
import ConfirmPopup from "../popup/popup2"; 
import PopupEditBooking from "../popup/popupeditbooking";
import { getBookingWithRetribusi, deleteBooking } from "../../api/api-booking";
import "./riwayatklien.css";

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
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
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
                    (item) => item.administrasis1?.some(admin => admin.id_user === userId)
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
            const biayaStr = formatRupiah(r.biaya);
            const layananStr = (r.pelayanans1 || [])
                .map(p => formatServiceDisplay(p, r.jenis_layanan))
                .filter(Boolean)
                .join(", ");
            const catatanStr = (r.administrasis1 || [])
                .map(a => a.catatan)
                .filter(Boolean)
                .join(", ");
            const allFields = `
                ${r.nama || r.id_pasien?.nama || ""}
                ${r.keluhan || ""}
                ${r.status_booking || ""}
                ${catatanStr}
                ${new Date(r.createdAt).toLocaleString()}
                ${new Date(r.updatedAt).toLocaleString()}
                ${biayaStr}
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
                    valueA = (a.nama || a.id_pasien?.nama || "").toLowerCase();
                    valueB = (b.nama || b.id_pasien?.nama || "").toLowerCase();
                } else if (sortBy === "biaya") {
                    const aVal = a.biaya?.$numberDecimal ?? a.biaya ?? 0;
                    const bVal = b.biaya?.$numberDecimal ?? b.biaya ?? 0;
                    valueA = parseFloat(aVal);
                    valueB = parseFloat(bVal);
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFiltered(result);
    }, [searchTerm, riwayat, sortBy, sortOrder]);

    const handleDelete = (booking) => {
        setBookingToDelete(booking);
        setShowConfirmPopup(true);
    };

    const handleEdit = (booking) => {
        setBookingToEdit(booking);
        setShowEditPopup(true);
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

    // Fungsi format layanan (dengan default jenis layanan fallback)
    const formatServiceDisplay = (pelayanan, defaultJenisLayanan) => {
        const nama = pelayanan.nama || pelayanan.id_pelayanan?.nama || "";
        const jenisLayanan = pelayanan.jenis_layanan || pelayanan.id_pelayanan?.jenis_layanan || defaultJenisLayanan || "";
        const formattedJenisLayanan = jenisLayanan.charAt(0).toUpperCase() + jenisLayanan.slice(1);
        return jenisLayanan ? `${nama} (${formattedJenisLayanan})` : nama;
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
                                        <td colSpan="11" className="no-data">Tidak ada data booking</td>
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
                                            <td>{r.administrasis1?.[0]?.catatan || "-"}</td>
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

            <PopupEditBooking isOpen={showEditPopup} onClose={handleCloseEditPopup} bookingData={bookingToEdit} />
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
        </>
    );
};

export default RiwayatPopup;
