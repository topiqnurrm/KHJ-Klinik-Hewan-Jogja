import React, { useState, useEffect } from 'react';
import './pasien.css';
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import hapusIcon from "../../../../components/riwayat/gambar/hapus.png";
import lihatIcon from "../../../../components/riwayat/gambar/lihat.png";
import { getPasienByUserId, deletePasienById, updatePasien, getAllPasien } from '../../../../api/api-pasien';
import EditPasien from './EditPasien'; // Import the EditPasien component
import LihatPasien from './LihatPasien'; // Import the LihatPasien component
import Popup from '../../admin_nav/popup_nav/popup2'; // Import the Popup component

const Pasien = () => {
    const [pasien, setPasien] = useState([]);
    const [filteredPasien, setFilteredPasien] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pasienToDelete, setPasienToDelete] = useState(null);
    const [users, setUsers] = useState({}); // Untuk menyimpan detail user untuk id_user
    
    // State untuk modal edit pasien
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPasien, setEditingPasien] = useState(null);
    
    // State untuk detail view pasien
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailPasien, setDetailPasien] = useState(null);
    
    // State untuk error message
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
    
    // State untuk user role
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const showErrorMessage = (message) => {
        setErrorMessage(message);
        setShowError(true);
        
        // Hapus pesan error setelah 2 detik
        setTimeout(() => {
            setShowError(false);
        }, 2000);
    };

    const fetchCurrentUserRole = () => {
        try {
            // Dapatkan user dari localStorage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            setIsSuperAdmin(currentUser.aktor === "superadmin");
        } catch (error) {
            console.error('Gagal membaca data user:', error);
            setIsSuperAdmin(false);
        }
    };

    const fetchAllPasien = async () => {
        setIsLoading(true);
        try {
            // Selalu ambil semua data pasien
            const allData = await getAllPasien();
            setPasien(allData);
            setFilteredPasien(allData);
            
            // Dapatkan ID user unik
            const userIds = [...new Set(allData.map(item => item.id_user))];
            fetchUserDetails(userIds);
        } catch (error) {
            console.error('Gagal fetch data pasien:', error);
            showErrorMessage("Gagal memuat data pasien: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserDetails = async (userIds) => {
        try {
            const userDetailsObj = {};
            
            // Fetch detail user untuk setiap ID user unik
            for (const userId of userIds) {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`);
                const userData = await response.json();
                userDetailsObj[userId] = userData;
            }
            
            setUsers(userDetailsObj);
        } catch (error) {
            console.error('Gagal fetch data users:', error);
            showErrorMessage("Gagal memuat data pemilik: " + (error.message || "Kesalahan server"));
        }
    };

    useEffect(() => {
        fetchCurrentUserRole();
        fetchAllPasien();
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = pasien.filter((item) => {
            const allFields = `
                ${item.nama || ""}
                ${item.jenis || ""}
                ${item.kategori || ""}
                ${users[item.id_user]?.nama || ""}
                ${item.jenis_kelamin || ""}
                ${item.ras || ""}
                ${new Date(item.createdAt).toLocaleString()}
                ${new Date(item.updatedAt).toLocaleString()}
            `.toLowerCase();
            return allFields.includes(lower);
        });

        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "tanggal") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === "nama" || sortBy === "jenis" || sortBy === "kategori" || sortBy === "jenis_kelamin" || sortBy === "ras") {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                } else if (sortBy === "id_user") {
                    valueA = (users[a.id_user]?.nama || "").toLowerCase();
                    valueB = (users[b.id_user]?.nama || "").toLowerCase();
                } else {
                    valueA = a[sortBy];
                    valueB = b[sortBy];
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredPasien(result);
    }, [searchTerm, pasien, sortBy, sortOrder, users]);

    const handleViewDetail = (pasien) => {
        setDetailPasien(pasien);
        setShowDetailModal(true);
    };

    const handleDelete = (pasien) => {
        if (!isSuperAdmin) {
            showErrorMessage("Anda tidak memiliki akses untuk menghapus pasien. Hanya Superadmin yang diizinkan.");
            return;
        }
        setPasienToDelete(pasien);
        setShowDeleteConfirm(true);
    };

    const confirmDeletePasien = async () => {
        if (!pasienToDelete || !isSuperAdmin) return;
        setIsLoading(true);
        setShowDeleteConfirm(false);

        try {
            await deletePasienById(pasienToDelete._id);
            
            const updatedPasien = pasien.filter(p => p._id !== pasienToDelete._id);
            setPasien(updatedPasien);
            setFilteredPasien(updatedPasien);
        } catch (error) {
            console.error("Gagal menghapus pasien:", error);
            showErrorMessage("Gagal menghapus pasien: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
            setPasienToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setPasienToDelete(null);
    };

    const getKategoriClass = (kategori) => {
        switch (kategori) {
            case "ternak":
                return "status-hijau";
            case "kesayangan / satwa liar":
                return "status-biru";
            case "unggas":
                return "status-kuning";
            default:
                return "";
        }
    };

    const handleEdit = (pasienItem) => {
        if (!isSuperAdmin) {
            showErrorMessage("Anda tidak memiliki akses untuk mengubah pasien. Hanya Superadmin yang diizinkan.");
            return;
        }
        setEditingPasien(pasienItem);
        setShowEditModal(true);
    };

    const handleAddPasien = () => {
        if (!isSuperAdmin) {
            showErrorMessage("Anda tidak memiliki akses untuk menambah pasien. Hanya Superadmin yang diizinkan.");
            return;
        }
        setShowAddModal(true);
    };

    const handleUpdatePasien = (updatedPasien) => {
        // Update pasien list dengan data yang sudah diupdate
        setPasien(prev => 
            prev.map(p => p._id === updatedPasien._id ? updatedPasien : p)
        );
        
        // Refresh semua data untuk memastikan konsistensi
        fetchAllPasien();
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingPasien(null);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setDetailPasien(null);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    return (
        <div className='pasien-container'>
            <div className="dashboard-header">
                <h1>Manajemen &gt; Pasien</h1>
            </div>
            
            {/* Error notification */}
            {showError && (
                <div className="error-notification">
                    {errorMessage}
                </div>
            )}
            
            <div className="riwayat-filter-container">
                {/* <button 
                    className={`tambah-user-button ${!isSuperAdmin ? 'disabled-button' : ''}`}
                    onClick={handleAddPasien}
                >
                    + Tambah Pasien
                </button> */}

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
                        <option value="jenis">Jenis</option>
                        <option value="kategori">Kategori</option>
                        <option value="id_user">Pemilik</option>
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
                                <th>Jenis</th>
                                <th>Kategori</th>
                                <th>Pemilik</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPasien.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-data">Tidak ada data pasien</td>
                                </tr>
                            ) : (
                                filteredPasien.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                                        <td>{new Date(item.updatedAt).toLocaleString()}</td>
                                        <td>{item.nama}</td>
                                        <td>{item.jenis}</td>
                                        <td>
                                            <span className={`status-label ${getKategoriClass(item.kategori)}`}>
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td>{users[item.id_user]?.nama || "Loading..."}</td>
                                        <td className="riwayat-actions">
                                            <button 
                                                className="btn-blue" 
                                                title="Lihat" 
                                                onClick={() => handleViewDetail(item)}
                                            >
                                                <img src={lihatIcon} alt="lihat" />
                                            </button>
                                            <button 
                                                className={`btn-green ${!isSuperAdmin ? 'disabled-button' : ''}`} 
                                                title="Edit" 
                                                onClick={() => handleEdit(item)}
                                            >
                                                <img src={editIcon} alt="edit" />
                                            </button>
                                            <button 
                                                className={`btn-red ${!isSuperAdmin ? 'disabled-button' : ''}`} 
                                                title="Hapus" 
                                                onClick={() => handleDelete(item)}
                                            >
                                                <img src={hapusIcon} alt="hapus" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {/* Edit Pasien Component */}
                {showEditModal && editingPasien && (
                    <EditPasien 
                        pasien={editingPasien} 
                        onClose={closeEditModal} 
                        onUpdate={handleUpdatePasien} 
                    />
                )}

                {/* Detail View Component */}
                {showDetailModal && detailPasien && (
                    <LihatPasien 
                        pasien={detailPasien} 
                        onClose={closeDetailModal} 
                        users={users}
                        getKategoriClass={getKategoriClass}
                    />
                )}

                {/* Delete Confirmation using Popup Component */}
                <Popup
                    isOpen={showDeleteConfirm}
                    onClose={cancelDelete}
                    title="Konfirmasi Hapus"
                    description={`Apakah Anda yakin ingin menghapus pasien ${pasienToDelete?.nama || 'ini'}?`}
                    onConfirm={confirmDeletePasien}
                />

                {/* This would be the Add Component, which is not shown in your provided code */}
                {/* {showAddModal && (
                    <TambahPasien 
                        onClose={closeAddModal} 
                        onAdd={(newPasien) => {
                            setPasien(prev => [...prev, newPasien]);
                            fetchAllPasien();
                        }} 
                    />
                )} */}
            </div>
            
            {/* CSS for disabled buttons and error notification */}
            <style jsx="true">{`
                .disabled-button {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .error-notification {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 10px 15px;
                    margin: 0 20px 15px 20px;
                    border: 1px solid #f5c6cb;
                    border-radius: 4px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default Pasien;