import React, { useState, useEffect } from 'react';
import './tindakan.css';
import { fetchLayanan } from '../../../../api/api-pelayanan'; // Adjust path as needed
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import hapusIcon from "../../../../components/riwayat/gambar/hapus.png";
import EditLayanan from './EditLayanan'; // Import the EditLayanan component
import TambahLayanan from './TambahLayanan'; // Import the TambahLayanan component

const Tindakan = () => {
    const [layanan, setLayanan] = useState([]);
    const [filteredLayanan, setFilteredLayanan] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [layananToDelete, setLayananToDelete] = useState(null);
    // New state for edit functionality
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [layananToEdit, setLayananToEdit] = useState(null);
    // New state for add functionality
    const [showAddPopup, setShowAddPopup] = useState(false);

    // Tambahkan di fetchAllLayanan untuk melihat struktur respons
    const fetchAllLayanan = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/pelayanan");
            const data = await response.json();
            
            setLayanan(data);
            setFilteredLayanan(data);
        } catch (error) {
            console.error('Gagal fetch data layanan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllLayanan();
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = layanan.filter((item) => {
            const allFields = `
                ${item.nama || ""}
                ${item.kategori || ""}
                ${item.harga_ternak?.toString() || ""}
                ${item.harga_kesayangan_satwaliar?.toString() || ""}
                ${item.harga_unggas?.toString() || ""}
                ${new Date(item.createdAt).toLocaleString()}
                ${new Date(item.updatedAt).toLocaleString()}
            `.toLowerCase();
            return allFields.includes(lower);
        });

        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "createdAt" || sortBy === "updatedAt") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "harga_ternak" || sortBy === "harga_kesayangan_satwaliar" || sortBy === "harga_unggas") {
                    // Handle Decimal128 objects by converting to string then number
                    valueA = parseFloat(a[sortBy]?.toString() || "0");
                    valueB = parseFloat(b[sortBy]?.toString() || "0");
                } else {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredLayanan(result);
    }, [searchTerm, layanan, sortBy, sortOrder]);

    const handleDelete = (layanan) => {
        setLayananToDelete(layanan);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteLayanan = async () => {
        if (!layananToDelete) return;
        setIsLoading(true);
        setShowDeleteConfirm(false);

        try {
            // Implement your delete API call here
            await fetch(`http://localhost:5000/api/pelayanan/${layananToDelete._id}`, {
                method: 'DELETE'
            });
            
            const updatedLayanan = layanan.filter(l => l._id !== layananToDelete._id);
            setLayanan(updatedLayanan);
            setFilteredLayanan(updatedLayanan);
        } catch (error) {
            console.error("Gagal menghapus layanan:", error);
            alert("Gagal menghapus layanan: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
            setLayananToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setLayananToDelete(null);
    };

    // Perbaikan fungsi formatCurrency di frontend
    const formatCurrency = (value) => {
        // Pastikan nilai tidak undefined atau null
        if (value === undefined || value === null) {
            return "Rp0";
        }
        
        let numValue;
        
        try {
            // Jika sudah number, gunakan langsung
            if (typeof value === 'number') {
                numValue = value;
            }
            // Jika string, parse ke float
            else if (typeof value === 'string') {
                numValue = parseFloat(value);
            }
            // Jika objek (kemungkinan Decimal128), konversi
            else if (typeof value === 'object') {
                // Coba berbagai pendekatan untuk mendapatkan nilai numerik
                if (value.toString) {
                    numValue = parseFloat(value.toString());
                } else if (value.$numberDecimal) {
                    numValue = parseFloat(value.$numberDecimal);
                } else {
                    numValue = 0;
                    console.error('Tidak dapat mengkonversi objek ke angka:', value);
                }
            } else {
                numValue = 0;
                console.error('Tipe data tidak dikenali:', typeof value);
            }
        } catch (error) {
            console.error('Error saat mengkonversi nilai harga:', error);
            numValue = 0;
        }
        
        // Check if the resulting value is NaN and provide a default
        if (isNaN(numValue)) {
            console.error('Hasil konversi adalah NaN untuk nilai:', value);
            return "Rp0";
        }
        
        // Format as currency
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    const getKategoriClass = (kategori) => {
        switch (kategori) {
            case "tindakan_umum":
                return "status-hijau";
            case "tindakan_khusus":
                return "status-kuning";
            case "lain_lain":
                return "status-biru";
            default:
                return "";
        }
    };

    const getKategoriDisplay = (kategori) => {
        switch (kategori) {
            case "tindakan_umum":
                return "Tindakan Umum";
            case "tindakan_khusus":
                return "Tindakan Khusus";
            case "lain_lain":
                return "Lain-lain";
            default:
                return kategori;
        }
    };

    // Updated handleAddLayanan function to show the add popup
    const handleAddLayanan = () => {
        setShowAddPopup(true);
    };

    // Handle new layanan added from TambahLayanan component
    const handleLayananAdded = (newLayanan) => {
        // Add the new layanan to our arrays
        const updatedLayanan = [...layanan, newLayanan];
        setLayanan(updatedLayanan);
        // Filter will be reapplied automatically through useEffect
    };

    // Close add popup
    const handleCloseAddPopup = () => {
        setShowAddPopup(false);
    };

    // Updated handleEdit function to show the edit popup
    const handleEdit = (layananItem) => {
        // Find the layanan by ID in our data
        const layananToEdit = layanan.find(l => l._id === layananItem._id);
        if (layananToEdit) {
            setLayananToEdit(layananToEdit);
            setShowEditPopup(true);
        } else {
            console.error("Layanan tidak ditemukan:", layananItem._id);
        }
    };

    // Handle successful update from EditLayanan component
    const handleUpdateLayanan = (updatedLayanan) => {
        // Update both layanan arrays with the new data
        const updatedArray = layanan.map(item => 
            item._id === updatedLayanan._id ? updatedLayanan : item
        );
        
        setLayanan(updatedArray);
        
        // Filter will be reapplied automatically through useEffect
        // but we need to set the base array first
        setFilteredLayanan(updatedArray);
    };

    // Close edit popup
    const handleCloseEditPopup = () => {
        setShowEditPopup(false);
        setLayananToEdit(null);
    };

    return (
        <div className='tindakan-container'>
            <div className="dashboard-header">
                <h1>Layanan</h1>
            </div>
            <div className="riwayat-filter-container">
                <button className="tambah-user-button" onClick={handleAddLayanan}>
                    + Tambah Layanan
                </button>
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
                        <option value="nama">Nama</option>
                        <option value="kategori">Kategori</option>
                        <option value="harga_ternak">Harga Ternak</option>
                        <option value="harga_kesayangan_satwaliar">Harga Kesayangan/Satwa Liar</option>
                        <option value="harga_unggas">Harga Unggas</option>
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
                                <th>Tanggal Update</th>
                                <th>Nama</th>
                                <th>Kategori</th>
                                <th>Harga Ternak</th>
                                <th>Harga Kesayangan / Satwa Liar</th>
                                <th>Harga Unggas</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLayanan.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">Tidak ada data layanan</td>
                                </tr>
                            ) : (
                                filteredLayanan.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                                        <td>{new Date(item.updatedAt).toLocaleString()}</td>
                                        <td>{item.nama}</td>
                                        <td>
                                            <span className={`status-label ${getKategoriClass(item.kategori)}`}>
                                                {getKategoriDisplay(item.kategori)}
                                            </span>
                                        </td>
                                        <td>{formatCurrency(item.harga_ternak)}</td>
                                        <td>{formatCurrency(item.harga_kesayangan_satwaliar)}</td>
                                        <td>{formatCurrency(item.harga_unggas)}</td>
                                        <td className="riwayat-actions">
                                            <button className="btn-green" title="Edit" onClick={() => handleEdit(item)}>
                                                <img src={editIcon} alt="edit" />
                                            </button>
                                            <button className="btn-red" title="Hapus" onClick={() => handleDelete(item)} disabled={isLoading}>
                                                <img src={hapusIcon} alt="hapus" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {showDeleteConfirm && (
                    <div className="confirm-popup-overlay">
                        <div className="confirm-popup">
                            <h3>Konfirmasi Hapus</h3>
                            <p>
                                Apakah Anda yakin ingin menghapus layanan <strong>{layananToDelete?.nama || 'ini'}</strong>?
                            </p>
                            <div className="confirm-buttons">
                                <button className="confirm-cancel" onClick={cancelDelete}>Batal</button>
                                <button className="confirm-delete" onClick={confirmDeleteLayanan}>Hapus</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Render the EditLayanan component when showEditPopup is true */}
                {showEditPopup && layananToEdit && (
                    <EditLayanan 
                        layanan={layananToEdit}
                        onClose={handleCloseEditPopup}
                        onUpdate={handleUpdateLayanan}
                    />
                )}

                {/* Render the TambahLayanan component when showAddPopup is true */}
                {showAddPopup && (
                    <TambahLayanan 
                        onClose={handleCloseAddPopup}
                        onAdd={handleLayananAdded}
                    />
                )}
            </div>
        </div>
    );
};

export default Tindakan;