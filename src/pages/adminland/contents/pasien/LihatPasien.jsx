import React, { useState, useEffect } from 'react';
import './LihatPasien.css'; // We'll update this CSS file

const LihatPasien = ({ pasien, onClose, users, getKategoriClass }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filteredPasien, setFilteredPasien] = useState([]);
    
    // Convert single pasien to array for display in table
    useEffect(() => {
        if (pasien) {
            setFilteredPasien([pasien]);
        } else {
            setFilteredPasien([]);
        }
    }, [pasien]);
    
    // Apply search and sort
    useEffect(() => {
        if (!pasien) return;
        
        let result = [pasien];
        
        // Apply search if there's a search term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p => {
                const allFields = `
                    ${p.nama || ''}
                    ${p.jenis || ''}
                    ${p.kategori || ''}
                    ${p.jenis_kelamin || ''}
                    ${p.ras || ''}
                    ${p.umur || ''}
                    ${users[p.id_user]?.nama || ''}
                    ${new Date(p.createdAt).toLocaleString()}
                    ${new Date(p.updatedAt).toLocaleString()}
                `.toLowerCase();
                return allFields.includes(lower);
            });
        }
        
        // Apply sort if there's a sort field
        if (sortBy) {
            result = result.sort((a, b) => {
                let valueA, valueB;
                if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                    valueA = new Date(a[sortBy]).getTime();
                    valueB = new Date(b[sortBy]).getTime();
                } else if (sortBy === 'umur') {
                    valueA = parseInt(a.umur || 0);
                    valueB = parseInt(b.umur || 0);
                } else {
                    valueA = (a[sortBy] || '').toLowerCase();
                    valueB = (b[sortBy] || '').toLowerCase();
                }
                return sortOrder === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
            });
        }
        
        setFilteredPasien(result);
    }, [pasien, searchTerm, sortBy, sortOrder, users]);

    if (!pasien) return null;

    return (
        <div className="detail-popup-overlay">
            <div className="detail-popup">
                <div className="detail-header">
                    <h2>Detail Pasien</h2>
                </div>
                
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
                            <option value="nama">Nama</option>
                            <option value="jenis">Jenis</option>
                            <option value="kategori">Kategori</option>
                            <option value="jenis_kelamin">Jenis Kelamin</option>
                            <option value="ras">Ras</option>
                            <option value="umur">Umur</option>
                            <option value="createdAt">Tanggal Buat</option>
                            <option value="updatedAt">Tanggal Update</option>
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
                
                <div className="detail-content">
                    <table className="riwayat-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Jenis</th>
                                <th>Kategori</th>
                                <th>Jenis Kelamin</th>
                                <th>Ras</th>
                                <th>Umur</th>
                                <th>Pemilik</th>
                                <th>Tanggal Buat</th>
                                <th>Tanggal Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPasien.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">Tidak ada data pasien</td>
                                </tr>
                            ) : (
                                filteredPasien.map((p) => (
                                    <tr key={p._id || "singleRow"}>
                                        <td>{p.nama || "-"}</td>
                                        <td>{p.jenis || "-"}</td>
                                        <td>
                                            <span className={`status-label ${getKategoriClass(p.kategori)}`}>
                                                {p.kategori || "-"}
                                            </span>
                                        </td>
                                        <td>{p.jenis_kelamin || "-"}</td>
                                        <td>{p.ras || "-"}</td>
                                        <td>{p.umur ? `${p.umur} bulan` : "-"}</td>
                                        <td>{users[p.id_user]?.nama || "-"}</td>
                                        <td>{new Date(p.createdAt).toLocaleString()}</td>
                                        <td>{new Date(p.updatedAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="detail-actions">
                    <button className="close-button" onClick={onClose}>Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default LihatPasien;