import React, { useState, useEffect } from 'react';
import './pengguna.css';
import { getAllUsers, deleteUser } from '../../../../api/api-user'; // Sesuaikan path ke api-user.js
import editIcon from "../../../../components/riwayat/gambar/edit.png";
import hapusIcon from "../../../../components/riwayat/gambar/hapus.png"; 
import EditUser from './EditUser'; // Import the EditUser component
import AddUser from './AddUser'; // Import the new AddUser component
import Popup from '../../admin_nav/popup_nav/popup2'; // Import the Popup component

const Pengguna = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    // State for edit functionality
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [userIdToEdit, setUserIdToEdit] = useState(null);
    // New state for add user functionality
    const [showAddPopup, setShowAddPopup] = useState(false);

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
        setUserIdToEdit(userId);
        setShowEditPopup(true);
    };

    // New handler for add user button
    const handleAddUser = () => {
        setShowAddPopup(true);
    };

    // Handle user update (for both edit and add)
    const handleUserUpdate = (updatedUser) => {
        // For edit: update the users array with the updated user data
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user._id === updatedUser._id ? updatedUser : user
            )
        );
    };

    // Handle new user creation
    const handleUserCreate = (newUser) => {
        // Add the new user to the users array
        setUsers(prevUsers => [...prevUsers, newUser]);
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
            // alert('User berhasil dihapus');
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
            <div className="riwayat-filter-container">
                <button className="tambah-user-button" onClick={handleAddUser}>
                    + Tambah Pengguna
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

                {/* Replace the custom delete confirmation with Popup2 component */}
                <Popup
                    isOpen={showDeleteConfirm}
                    onClose={cancelDelete}
                    title="Konfirmasi Hapus"
                    description={`Apakah Anda yakin ingin menghapus pengguna ${userToDelete?.nama || 'ini'}?`}
                    onConfirm={confirmDeleteUser}
                />

                {/* Render the EditUser component when showEditPopup is true */}
                {showEditPopup && (
                    <EditUser 
                        userId={userIdToEdit}
                        onClose={() => {
                            setShowEditPopup(false);
                            setUserIdToEdit(null);
                        }}
                        onUpdate={handleUserUpdate}
                    />
                )}

                {/* Render the AddUser component when showAddPopup is true */}
                {showAddPopup && (
                    <AddUser 
                        onClose={() => setShowAddPopup(false)}
                        onUpdate={handleUserCreate}
                    />
                )}
            </div>
        </div>
    );
};

export default Pengguna;