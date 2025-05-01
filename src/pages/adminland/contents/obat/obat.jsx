import React, { useState, useEffect } from 'react';
import './obat.css';
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import hapusIcon from "../../../../components/riwayat/gambar/hapus.png";
// Import the components
import EditProduk from './EditProduk';
import TambahProduk from './TambahProduk';
import Popup from '../../admin_nav/popup_nav/popup2'; // Import the Popup component

const Obat = () => {
    const [produk, setProduk] = useState([]);
    const [filteredProduk, setFilteredProduk] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [produkToDelete, setProdukToDelete] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false); // Changed from showDeleteConfirm
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [produkToEdit, setProdukToEdit] = useState(null);
    const [showAddPopup, setShowAddPopup] = useState(false);

    const fetchAllProduk = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/produk");
            const data = await response.json();
            
            // Process Decimal128 objects before setting state
            const processedData = data.map(item => ({
                ...item,
                // Convert Decimal128 to string or number
                harga: parseDecimal128(item.harga),
                stok: parseDecimal128(item.stok)
            }));
            
            setProduk(processedData);
            setFilteredProduk(processedData);
        } catch (error) {
            console.error('Gagal fetch data produk:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to parse Decimal128 values
    const parseDecimal128 = (value) => {
        if (!value) return 0;
        
        // If it's a Decimal128 object with $numberDecimal
        if (value.$numberDecimal) {
            return parseFloat(value.$numberDecimal);
        }
        
        // If it's already a number
        if (typeof value === 'number') {
            return value;
        }
        
        // If it's a string that can be parsed
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        
        // Try toString() as last resort
        try {
            return parseFloat(value.toString());
        } catch (e) {
            console.error('Failed to parse Decimal128:', e);
            return 0;
        }
    };

    useEffect(() => {
        fetchAllProduk();
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = produk.filter((item) => {
            const allFields = `
                ${item.nama || ""}
                ${item.kategori || ""}
                ${item.jenis || ""}
                ${item.harga?.toString() || ""}
                ${item.stok?.toString() || ""}
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
                } else if (sortBy === "harga" || sortBy === "stok") {
                    valueA = parseFloat(a[sortBy]?.toString() || "0");
                    valueB = parseFloat(b[sortBy]?.toString() || "0");
                } else {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredProduk(result);
    }, [searchTerm, produk, sortBy, sortOrder]);

    const handleDelete = (produk) => {
        setProdukToDelete(produk);
        setShowDeletePopup(true); // Show the popup2 component
    };

    const confirmDeleteProduk = async () => {
        if (!produkToDelete) return;
        setIsLoading(true);
        setShowDeletePopup(false);

        try {
            await fetch(`http://localhost:5000/api/produk/${produkToDelete._id}`, {
                method: 'DELETE'
            });
            
            const updatedProduk = produk.filter(p => p._id !== produkToDelete._id);
            setProduk(updatedProduk);
            setFilteredProduk(updatedProduk);
        } catch (error) {
            console.error("Gagal menghapus produk:", error);
            alert("Gagal menghapus produk: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
            setProdukToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
        setProdukToDelete(null);
    };

    const formatCurrency = (value) => {
        // Make sure we have a number to format
        const numValue = parseFloat(value) || 0;
        
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
            case "antibiotik":
                return "status-hijau";
            case "antijamur":
                return "status-kuning";
            case "antiradang":
                return "status-merah";
            case "penenang":
                return "status-biru";
            case "suplemen":
                return "status-hijau";
            case "antisimtomatik":
                return "status-kuning";
            case "tetes":
                return "status-merah";
            case "vaksin_hewan_kesayangan":
                return "status-biru";
            case "vaksin_unggas":
                return "status-hijau";
            case "tambahan":
                return "status-kuning";
            default:
                return "";
        }
    };

    const getKategoriDisplay = (kategori) => {
        switch (kategori) {
            case "antibiotik":
                return "Antibiotik";
            case "antijamur":
                return "Antijamur";
            case "antiradang":
                return "Antiradang";
            case "penenang":
                return "Penenang";
            case "suplemen":
                return "Suplemen";
            case "antisimtomatik":
                return "Antisimtomatik";
            case "tetes":
                return "Tetes";
            case "vaksin_hewan_kesayangan":
                return "Vaksin Hewan Kesayangan";
            case "vaksin_unggas":
                return "Vaksin Unggas";
            case "tambahan":
                return "Tambahan";
            default:
                return kategori;
        }
    };

    const getJenisDisplay = (jenis) => {
        switch (jenis) {
            case "mililiter":
                return "Mililiter";
            case "tablet":
                return "Tablet";
            case "kapsul":
                return "Kapsul";
            case "kaplet":
                return "Kaplet";
            case "botol":
                return "Botol";
            case "tube":
                return "Tube";
            case "vial":
                return "Vial";
            case "dosis":
                return "Dosis";
            case "buah":
                return "Buah";
            case "kali":
                return "Kali";
            default:
                return jenis;
        }
    };

    const handleAddProduk = () => {
        setShowAddPopup(true);
    };

    const handleProdukAdded = (newProduk) => {
        // Make sure to parse the Decimal128 values
        const processedProduk = {
            ...newProduk,
            harga: parseDecimal128(newProduk.harga),
            stok: parseDecimal128(newProduk.stok)
        };
        
        const updatedProduk = [...produk, processedProduk];
        setProduk(updatedProduk);
        setFilteredProduk(updatedProduk);
    };

    const handleCloseAddPopup = () => {
        setShowAddPopup(false);
    };

    const handleEdit = (produkItem) => {
        const produkToEdit = produk.find(p => p._id === produkItem._id);
        if (produkToEdit) {
            setProdukToEdit(produkToEdit);
            setShowEditPopup(true);
        } else {
            console.error("Produk tidak ditemukan:", produkItem._id);
        }
    };

    const handleUpdateProduk = (updatedProduk) => {
        // Process the updated produk's Decimal128 values
        const processedProduk = {
            ...updatedProduk,
            harga: parseDecimal128(updatedProduk.harga),
            stok: parseDecimal128(updatedProduk.stok)
        };
        
        const updatedArray = produk.map(item => 
            item._id === processedProduk._id ? processedProduk : item
        );
        
        setProduk(updatedArray);
        setFilteredProduk(updatedArray);
    };

    const handleCloseEditPopup = () => {
        setShowEditPopup(false);
        setProdukToEdit(null);
    };

    return (
        <div className='obat-container'>
            <div className="dashboard-header">
                <h1>Obat</h1>
            </div>
            <div className="riwayat-filter-container">
                <button className="tambah-user-button" onClick={handleAddProduk}>
                    + Tambah Obat
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
                        <option value="updatedAt">Tanggal Update</option>
                        <option value="nama">Nama</option>
                        <option value="kategori">Kategori</option>
                        <option value="jenis">Jenis</option>
                        <option value="harga">Harga</option>
                        <option value="stok">Stok</option>
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
                                <th>Jenis</th>
                                <th>Harga</th>
                                <th>Stok</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProduk.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">Tidak ada data obat</td>
                                </tr>
                            ) : (
                                filteredProduk.map((item, index) => (
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
                                        <td>{getJenisDisplay(item.jenis)}</td>
                                        <td>{formatCurrency(item.harga)}</td>
                                        <td>{item.stok}</td>
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

                {/* Replace the custom confirmation dialog with the Popup2 component */}
                <Popup 
                    isOpen={showDeletePopup}
                    onClose={cancelDelete}
                    title="Konfirmasi Hapus"
                    description={
                        <p>
                            Apakah Anda yakin ingin menghapus obat <strong>{produkToDelete?.nama || 'ini'}</strong>?
                        </p>
                    }
                    onConfirm={confirmDeleteProduk}
                />

                {/* Render the EditProduk component when showEditPopup is true */}
                {showEditPopup && produkToEdit && (
                    <EditProduk 
                        produk={produkToEdit}
                        onClose={handleCloseEditPopup}
                        onUpdate={handleUpdateProduk}
                    />
                )}

                {/* Use the TambahProduk component properly */}
                {showAddPopup && (
                    <TambahProduk 
                        onClose={handleCloseAddPopup}
                        onAdd={handleProdukAdded}
                    />
                )}
            </div>
        </div>
    );
};

export default Obat;