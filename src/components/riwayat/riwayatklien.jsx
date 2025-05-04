import React, { useEffect, useState, useRef } from "react";
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
    const [debugInfo, setDebugInfo] = useState(null); // State untuk debugging

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
                
                // Debug: Cek salah satu data untuk melihat struktur administrasis1
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

    // Perbaikan fungsi getLatestNote untuk mengembalikan catatan berdasarkan data buat terbaru
    const getLatestNote = (administrasisArray) => {
        // Debug
        console.log("Receiving administrasisArray:", administrasisArray);
        
        // Pastikan array ada dan tidak kosong
        if (!administrasisArray || !Array.isArray(administrasisArray) || administrasisArray.length === 0) {
            console.log("Array kosong atau tidak valid, mengembalikan default");
            return { catatan: "-", status_administrasi: "", tanggal: null };
        }

        // Buat salinan array untuk mencegah modifikasi array asli
        let adminCopy = [...administrasisArray];

        // Debug - cetak semua tanggal sebelum sorting
        console.log("Tanggal sebelum sorting:", adminCopy.map(a => ({
            tanggal: a.tanggal,
            catatan: a.catatan,
            createdAt: a.createdAt,
            parsed: a.createdAt ? new Date(a.createdAt) : new Date(a.tanggal)
        })));

        // Urutkan array berdasarkan createdAt atau tanggal jika createdAt tidak ada
        // Urutan DESCENDING (dari yang terbaru)
        adminCopy.sort((a, b) => {
            // Prioritaskan berdasarkan createdAt jika ada
            const dateFieldA = a.createdAt || a.tanggal;
            const dateFieldB = b.createdAt || b.tanggal;
            
            // Jika tanggal tidak valid, letakkan di akhir
            if (!dateFieldA) return 1;
            if (!dateFieldB) return -1;
            
            // Ubah string tanggal menjadi objek Date
            const dateA = new Date(dateFieldA);
            const dateB = new Date(dateFieldB);
            
            // Validasi untuk memastikan tanggal valid
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            
            // Urutan descending (terbaru dulu)
            return dateB - dateA;
        });

        // Debug - cetak hasil sorting
        console.log("Hasil setelah sorting:", adminCopy.map(a => ({
            tanggal: a.tanggal,
            createdAt: a.createdAt,
            catatan: a.catatan
        })));

        // Ambil elemen pertama (terbaru) setelah pengurutan
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
            
            // Get the complete latest note object with improved debugging
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

        // Sorting logic
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

                // Handle null values
                if (valueA === null || valueA === undefined) valueA = sortOrder === "asc" ? "" : "zzz";
                if (valueB === null || valueB === undefined) valueB = sortOrder === "asc" ? "" : "zzz";

                // Comparison
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

    // Komponen untuk menampilkan debugging info
    const DebugPanel = ({data}) => {
        if (!data) return null;
        
        // Buat salinan array dan urutkan terbalik
        const reversedAdministrasis = data.administrasis1 ? [...data.administrasis1].reverse() : [];
        
        return (
            <div style={{margin: "20px 0", padding: "10px", backgroundColor: "#f5f5f5", border: "1px solid #ddd"}}>
                <h3>Debug Info:</h3>
                <p><strong>Item ID:</strong> {data.itemId}</p>
                <div>
                    <strong>All administrasis1 entries:</strong>
                    <pre style={{maxHeight: "200px", overflow: "auto"}}>
                        {JSON.stringify(reversedAdministrasis, null, 2)}
                    </pre>
                </div>
                <div>
                    <strong>Latest Note Selected:</strong>
                    <pre>
                        {JSON.stringify(data.latestNote, null, 2)}
                    </pre>
                </div>
            </div>
        );
    };

    // Fungsi untuk menampilkan semua catatan dalam administrasis1
    const showAllNotes = (administrasis) => {
        if (!administrasis || !Array.isArray(administrasis) || administrasis.length === 0) {
            return <span className="no-notes">Tidak ada catatan</span>;
        }

        // Urutkan dari yang terbaru ke terlama
        const sortedNotes = [...administrasis].sort((a, b) => {
            if (!a.tanggal) return 1;
            if (!b.tanggal) return -1;
            return new Date(b.tanggal) - new Date(a.tanggal);
        });

        return (
            <div className="all-notes">
                {sortedNotes.map((admin, idx) => (
                    <div key={idx} className="note-item">
                        <div className="note-date">
                            {admin.tanggal ? new Date(admin.tanggal).toLocaleDateString("id-ID") : "Tanggal tidak tersedia"}
                        </div>
                        <div className="note-content">
                            {admin.catatan || "-"}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title="Riwayat Pemeriksaan Hewan Saya">
                {/* Tampilkan panel debugging jika ada data */}
                {/* {debugInfo && <DebugPanel data={debugInfo} />} */}
                
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
                                    {/* <th>Semua Catatan</th> */}
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
                                            {/* <td>{showAllNotes(r.administrasis1)}</td> */}
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

            {/* Tambahkan CSS untuk styling tampilan catatan */}
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
            `}</style>
        </>
    );
};

export default RiwayatPopup;