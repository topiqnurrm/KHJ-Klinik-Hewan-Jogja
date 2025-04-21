import React, { useEffect, useState } from "react";
import Popup from "../popup/popupriwayat";
import { getAllBooking } from "../../api/api-booking";
import "./riwayatklien.css";

const RiwayatPopup = ({ isOpen, onClose }) => {
    const [riwayat, setRiwayat] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState(""); // state untuk memilih kategori sortir
    const [sortOrder, setSortOrder] = useState("asc"); // urutan sortir: "asc" atau "desc"

    useEffect(() => {
        if (isOpen) {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const userId = storedUser?._id;

            if (!userId) return;

            getAllBooking()
                .then((data) => {
                    const filteredByUser = data.filter(
                        (item) => item.id_pasien?.id_user === userId
                    );
                    setRiwayat(filteredByUser);
                    setFiltered(filteredByUser);
                })
                .catch((err) => console.error(err));
        }
    }, [isOpen]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = riwayat.filter((r) => {
            const allFields = `
                ${r.id_pasien?.nama_hewan || ""}
                ${r.keluhan || ""}
                ${r.status_booking || ""}
                ${r.administrasis1?.[0]?.catatan || ""}
                ${new Date(r.createdAt).toLocaleString()}
                ${new Date(r.updatedAt).toLocaleString()}
                ${r.pelayanans1?.reduce((total, p) => total + (p.jumlah || 0), 0)}
            `.toLowerCase();

            return allFields.includes(lower);
        });

        // Sort berdasarkan pilihan
        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "createdAt" || sortBy === "updatedAt") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "nama_hewan") {
                    valueA = a.id_pasien?.nama_hewan.toLowerCase();
                    valueB = b.id_pasien?.nama_hewan.toLowerCase();
                } else if (sortBy === "biaya") {
                    valueA = a.pelayanans1?.reduce((total, p) => total + (p.jumlah || 0), 0) || 0;
                    valueB = b.pelayanans1?.reduce((total, p) => total + (p.jumlah || 0), 0) || 0;
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
                {/* Filter Pencarian */}
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

                {/* Sortir */}
                <div className="riwayat-sort-wrapper">
                    <select
                        className="riwayat-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Urutkan...</option>
                        <option value="createdAt">Tanggal Awal</option>
                        <option value="updatedAt">Terakhir Diedit</option>
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

            {/* Tabel Riwayat */}
            <div className="riwayat-popup-content">
                <table className="riwayat-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tanggal Awal</th>
                            <th>Terakhir Diedit</th>
                            <th>Nama Hewan</th>
                            <th>Keluhan</th>
                            <th>Biaya</th>
                            <th>Catatan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r, index) => (
                            <tr key={r._id}>
                                <td>{index + 1}</td>
                                <td>{new Date(r.createdAt).toLocaleString()}</td>
                                <td>{new Date(r.updatedAt).toLocaleString()}</td>
                                <td>{r.id_pasien?.nama_hewan || "Tidak diketahui"}</td>
                                <td>{r.keluhan}</td>
                                <td>
                                    {r.pelayanans1?.length > 0
                                        ? r.pelayanans1.reduce((total, p) => total + (p.jumlah || 0), 0)
                                        : 0}
                                </td>
                                <td>{r.administrasis1?.[0]?.catatan || "-"}</td>
                                <td>{r.status_booking}</td>
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
