import React, { useEffect, useState } from "react";
import Popup from "../popup/popupriwayat";
import { getBookingWithRetribusi } from "../../api/api-booking";
import "./riwayatklien.css";

const formatRupiah = (value) => {
    if (!value) return "Rp0";
    const amount = typeof value === "object" && value.$numberDecimal
        ? parseFloat(value.$numberDecimal)
        : typeof value === "string"
        ? parseFloat(value)
        : value;
    return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
};

const RiwayatPopup = ({ isOpen, onClose }) => {
    const [riwayat, setRiwayat] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    useEffect(() => {
        if (isOpen) {
            // Reset filter states
            setSearchTerm("");  // Reset search term
            setSortBy("");      // Reset sort by
            setSortOrder("asc"); // Reset sort order to default (ascending)
    
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const userId = storedUser?._id;
    
            if (!userId) return;
    
            getBookingWithRetribusi()
                .then((data) => {
                    const filteredByUser = data.filter(
                        (item) => item.id_pasien?.id_user === userId
                    );
                    setRiwayat(filteredByUser);
                    setFiltered(filteredByUser);
                })
                .catch((err) => console.error(err));
        }
    }, [isOpen]); // Depend on isOpen to trigger the effect when the popup opens
    
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

        // Sorting
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

    return (
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
                        <option value="createdAt">Tanggal Awal</option>
                        <option value="updatedAt">Terakhir Diedit</option>
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
                        {filtered.map((r, index) => (
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
                                <td>{r.status_booking}</td>
                                <td>{new Date(r.updatedAt).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => alert(`Lihat detail ${r._id}`)}>🔍</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Popup>
    );
};

export default RiwayatPopup;
