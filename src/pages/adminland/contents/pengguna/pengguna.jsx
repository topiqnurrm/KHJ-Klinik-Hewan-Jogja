import React, { useState, useEffect } from 'react';
import './pengguna.css';
import { getAllUsers, deleteUser } from '../../../../api/api-user'; // Sesuaikan path ke api-user.js
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import hapusIcon from "../../../../components/riwayat/gambar/hapus.png"; 

const Pengguna = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Gagal fetch data users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = users.filter((user) => {
            const allFields = `
                ${user.nama || ""}
                ${user.email || ""}
                ${user.telepon || ""}
                ${user.aktor || ""}
                ${new Date(user.createdAt).toLocaleString()}
                ${new Date(user.updatedAt).toLocaleString()}
            `.toLowerCase();
            return allFields.includes(lower);
        });

        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === "createdAt" || sortBy === "updatedAt") {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else {
                    valueA = (a[sortBy] || "").toLowerCase();
                    valueB = (b[sortBy] || "").toLowerCase();
                }
                return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }

        setFilteredUsers(result);
    }, [searchTerm, users, sortBy, sortOrder]);

    const handleDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleEdit = (userId) => {
        // Function to handle edit
        alert(`Edit user with ID: ${userId}`);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setIsLoading(true);
        setShowDeleteConfirm(false);

        try {
            await deleteUser(userToDelete._id);
            const updatedUsers = users.filter(u => u._id !== userToDelete._id);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            alert('User berhasil dihapus');
        } catch (error) {
            console.error("Gagal menghapus user:", error);
            alert("Gagal menghapus user: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const getAktorClass = (aktor) => {
        switch (aktor) {
            case "superadmin":
                return "status-merah";
            case "administrasi":
            case "pembayaran":
                return "status-kuning";
            case "dokter":
            case "paramedis":
                return "status-hijau";
            case "klien":
                return "status-biru";
            default:
                return "";
        }
    };

    return (
        <div className='pengguna-container'>
            <div className="dashboard-header">
                <h1>Pengguna</h1>
            </div>
            <div className="dashboard-content">
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
                            <option value="nama">Nama</option>
                            <option value="email">Email</option>
                            <option value="aktor">Hak Akses</option>
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

                {isLoading ? (
                    <div className="loading-indicator">Memuat data...</div>
                ) : (
                    <table className="riwayat-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal Buat</th>
                                <th>Tanggal Update</th>
                                <th>Email</th>
                                <th>Nama</th>
                                <th>Telepon</th>
                                <th>Hak Akses</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-data">Tidak ada data pengguna</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user._id}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                                        <td>{new Date(user.updatedAt).toLocaleString()}</td>
                                        <td>{user.email}</td>
                                        <td>{user.nama}</td>
                                        <td>{user.telepon}</td>
                                        <td>
                                            <span className={`status-label ${getAktorClass(user.aktor)}`}>
                                                {user.aktor}
                                            </span>
                                        </td>
                                        <td className="riwayat-actions">
                                            <button className="btn-green" title="Edit" onClick={() => handleEdit(user._id)}>
                                                <img src={editIcon} alt="edit" />
                                            </button>
                                            <button className="btn-red" title="Hapus" onClick={() => handleDelete(user)} disabled={isLoading}>
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
                                Apakah Anda yakin ingin menghapus pengguna <strong>{userToDelete?.nama || 'ini'}</strong>?
                            </p>
                            <div className="confirm-buttons">
                                <button className="confirm-cancel" onClick={cancelDelete}>Batal</button>
                                <button className="confirm-delete" onClick={confirmDeleteUser}>Hapus</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pengguna;