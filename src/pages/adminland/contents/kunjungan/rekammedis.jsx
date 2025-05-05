import menunggu from './gambar/menunggu.png';
import dirawat from './gambar/inap.png';
import selesai from './gambar/selesai.png';

import React, { useState, useEffect } from 'react';
import './rekammedis.css';

// Dummy data untuk obat
const dummyObatOptions = [
    { id: 1, nama: "Paracetamol", harga: 9000 },
    { id: 2, nama: "Amoxicillin", harga: 12000 },
    { id: 3, nama: "Ranitidine", harga: 1500 },
    { id: 4, nama: "Ibuprofen", harga: 2000 },
    { id: 5, nama: "Cetirizine", harga: 5000 },
    { id: 6, nama: "Antasida", harga: 8000 },
    { id: 7, nama: "Vitamin C", harga: 3500 },
    { id: 8, nama: "Dexamethasone", harga: 15000 }
];

// Dummy data untuk layanan
const dummyLayananOptions = [
    { id: 1, nama: "Cek Darah", harga: 200000 },
    { id: 2, nama: "Rawat Inap", harga: 250000 },
    { id: 3, nama: "Vaksinasi", harga: 150000 },
    { id: 4, nama: "Grooming", harga: 100000 },
    { id: 5, nama: "X-Ray", harga: 350000 },
    { id: 6, nama: "USG", harga: 400000 }
];

const Rekammedis = ({ kunjunganData, onBack }) => {
    // State untuk data rekam medis
    const [rekamMedisData, setRekamMedisData] = useState({
        keluhan: "",
        diagnosa: "",
        beratBadan: "",
        suhuBadan: "",
        pemeriksaan: "",
        hasil: ""
    });

    // State untuk obat dan layanan
    const [selectedObat, setSelectedObat] = useState("");
    const [qtyObat, setQtyObat] = useState(1);
    const [obatList, setObatList] = useState([]);
    
    const [selectedLayanan, setSelectedLayanan] = useState("");
    const [qtyLayanan, setQtyLayanan] = useState(1);
    const [layananList, setLayananList] = useState([]);

    // State untuk status pasien
    const [statusPasien, setStatusPasien] = useState("menunggu");

    // Fungsi untuk menambah obat ke list
    const handleTambahObat = () => {
        if (selectedObat) {
            const obatData = dummyObatOptions.find(o => o.id === parseInt(selectedObat));
            if (obatData) {
                const newObat = {
                    id: Date.now(), // Unique ID for the item
                    namaObat: obatData.nama,
                    qty: qtyObat,
                    harga: obatData.harga,
                    subtotal: obatData.harga * qtyObat
                };
                setObatList([...obatList, newObat]);
                setSelectedObat("");
                setQtyObat(1);
            }
        }
    };

    // Fungsi untuk menambah layanan ke list
    const handleTambahLayanan = () => {
        if (selectedLayanan) {
            const layananData = dummyLayananOptions.find(l => l.id === parseInt(selectedLayanan));
            if (layananData) {
                const newLayanan = {
                    id: Date.now(), // Unique ID for the item
                    namaLayanan: layananData.nama,
                    qty: qtyLayanan,
                    harga: layananData.harga,
                    subtotal: layananData.harga * qtyLayanan
                };
                setLayananList([...layananList, newLayanan]);
                setSelectedLayanan("");
                setQtyLayanan(1);
            }
        }
    };

    // Fungsi untuk menghapus obat dari list
    const handleHapusObat = (id) => {
        setObatList(obatList.filter(item => item.id !== id));
    };

    // Fungsi untuk menghapus layanan dari list
    const handleHapusLayanan = (id) => {
        setLayananList(layananList.filter(item => item.id !== id));
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRekamMedisData({
            ...rekamMedisData,
            [name]: value
        });
    };

    // Simpan rekam medis
    const handleSimpan = () => {
        const rekamMedisComplete = {
            ...rekamMedisData,
            obatList,
            layananList,
            statusPasien,
            kunjunganId: kunjunganData._id,
            pasienInfo: {
                nama: kunjunganData.nama_hewan,
                klien: kunjunganData.klien
            }
        };
        
        console.log("Data rekam medis yang akan disimpan:", rekamMedisComplete);
        alert("Data rekam medis berhasil disimpan!");
        // Di sini bisa tambahkan API call untuk simpan ke database
        
        // Kembali ke halaman kunjungan
        onBack();
    };

    return (
        <div className='rekammedis-container'>
            <div className="dashboard-header">
                <div className="header-with-back">
                    <h1>
                        Aktivitas &gt; <span className="navigation-link" onClick={onBack}>Kunjungan</span> &gt; Rekam Medis - {kunjunganData?.nama_hewan || 'Pasien'}
                    </h1>
                    {/* <div className="header-spacer"></div> */}
                    <button className="simpan-button" onClick={handleSimpan}>
                        Simpan Rekam Medis
                    </button>
                </div>
            </div>
            
            <div className="rekammedis-content">
                <div className="rekammedis-columns">
                    {/* Kolom Kiri */}
                    <div className="rekammedis-column left-column">
                        {/* Biodata Pasien */}
                        <div className="rekammedis-section1">
                            <div className="section-header biodata-header">Biodata Pasien</div>
                            <div className="biodata-content">
                                <div className="biodata-row">
                                    <div className="biodata-label">Klien</div>
                                    <div className="biodata-separator">:</div>
                                    <div className="biodata-value">{kunjunganData?.klien || '-'}</div>
                                </div>
                                <div className="biodata-row">
                                    <div className="biodata-label">Nama Pasien</div>
                                    <div className="biodata-separator">:</div>
                                    <div className="biodata-value">{kunjunganData?.nama_hewan || '-'}</div>
                                </div>
                                <div className="biodata-row">
                                    <div className="biodata-label">Jenis Kelamin</div>
                                    <div className="biodata-separator">:</div>
                                    <div className="biodata-value">Jantan</div>
                                </div>
                                <div className="biodata-row">
                                    <div className="biodata-label">Jenis Hewan</div>
                                    <div className="biodata-separator">:</div>
                                    <div className="biodata-value">Kucing</div>
                                </div>
                            </div>
                        </div>

                        {/* Rekam Medis */}
                        <div className="rekammedis-section2">
                            <div className="section-header rekam-header">Rekam Medis</div>
                            <div className="rekam-content">
                                <div className="form-group">
                                    <label>Keluhan</label>
                                    <textarea 
                                        name="keluhan" 
                                        value={rekamMedisData.keluhan}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan keluhan pasien..."
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Diagnosa</label>
                                    <textarea 
                                        name="diagnosa" 
                                        value={rekamMedisData.diagnosa}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan diagnosa..."
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Berat Badan</label>
                                    <input 
                                        type="text" 
                                        name="beratBadan"
                                        value={rekamMedisData.beratBadan}
                                        onChange={handleInputChange}
                                        placeholder="Kg"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Suhu Badan</label>
                                    <input 
                                        type="text" 
                                        name="suhuBadan"
                                        value={rekamMedisData.suhuBadan}
                                        onChange={handleInputChange}
                                        placeholder="°C"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pemeriksaan</label>
                                    <textarea 
                                        name="pemeriksaan"
                                        value={rekamMedisData.pemeriksaan}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan hasil pemeriksaan..."
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Hasil</label>
                                    <textarea 
                                        name="hasil"
                                        value={rekamMedisData.hasil}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan hasil..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan */}
                    <div className="rekammedis-column right-column">
                        {/* Status Pemeriksaan */}
                        <div className="rekammedis-section3">
                            <div className="section-header status-header">Status Pemeriksaan</div>
                            <div className="status-content">
                                {/* <div className="status-row">
                                    <div className="status-label">Dokter</div>
                                    <div className="status-separator">:</div>
                                    <div className="status-multi-value">
                                        <div>dokter 1</div>
                                        <div>dokter 2</div>
                                        <div>dokter 3</div>
                                    </div>
                                </div> */}
                                <div className="status-row">
                                    <div className="status-label">Status Pasien</div>
                                    <div className="status-separator">:</div>
                                    <div className="status-icons">
                                        <button 
                                            className={`status-icon ${statusPasien === "menunggu" ? "status-active" : ""}`}
                                            onClick={() => setStatusPasien("menunggu")}
                                        >
                                            <img src={menunggu} alt="Menunggu" />
                                        </button>
                                        <button 
                                            className={`status-icon ${statusPasien === "dirawat" ? "status-active" : ""}`}
                                            onClick={() => setStatusPasien("dirawat")}
                                        >
                                            <img src={dirawat} alt="Dirawat" />
                                        </button>
                                        <button 
                                            className={`status-icon ${statusPasien === "selesai" ? "status-active" : ""}`}
                                            onClick={() => setStatusPasien("selesai")}
                                        >
                                            <img src={selesai} alt="Selesai" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pemakaian Obat dan Layanan */}
                        <div className="rekammedis-section4">
                            <div className="section-header obat-header">Pemakaian Obat dan Layanan</div>
                            
                            {/* Bagian Obat */}
                            <div className="obat-content">
                                <div className="obat-header">
                                    <h3>Obat</h3>
                                    <div className="obat-add">
                                        <button className="tambah-button" onClick={handleTambahObat}>+ Tambah</button>
                                    </div>
                                </div>
                                
                                <div className="obat-selection">
                                    <select 
                                        value={selectedObat} 
                                        onChange={(e) => setSelectedObat(e.target.value)}
                                    >
                                        <option value="">Pilih Obat</option>
                                        {dummyObatOptions.map(obat => (
                                            <option key={obat.id} value={obat.id}>{obat.nama}</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={qtyObat} 
                                        onChange={(e) => setQtyObat(parseInt(e.target.value) || 1)}
                                        className="qty-input"
                                    />
                                </div>
                                
                                <table className="obat-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Obat</th>
                                            <th>Qty</th>
                                            <th>Harga</th>
                                            <th>Subtotal</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {obatList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="no-data">Belum ada obat</td>
                                            </tr>
                                        ) : (
                                            obatList.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.namaObat}</td>
                                                    <td>{item.qty}</td>
                                                    <td>Rp {item.harga.toLocaleString()}</td>
                                                    <td>Rp {item.subtotal.toLocaleString()}</td>
                                                    <td>
                                                        <button 
                                                            className="hapus-button"
                                                            onClick={() => handleHapusObat(item.id)}
                                                        >
                                                            ✖
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Bagian Layanan */}
                            <div className="layanan-content">
                                <div className="layanan-header">
                                    <h3>Layanan</h3>
                                    <div className="layanan-add">
                                        <button className="tambah-button" onClick={handleTambahLayanan}>+ Tambah</button>
                                    </div>
                                </div>
                                
                                <div className="layanan-selection">
                                    <select 
                                        value={selectedLayanan} 
                                        onChange={(e) => setSelectedLayanan(e.target.value)}
                                    >
                                        <option value="">Pilih Layanan</option>
                                        {dummyLayananOptions.map(layanan => (
                                            <option key={layanan.id} value={layanan.id}>{layanan.nama}</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={qtyLayanan} 
                                        onChange={(e) => setQtyLayanan(parseInt(e.target.value) || 1)}
                                        className="qty-input"
                                    />
                                </div>
                                
                                <table className="layanan-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Layanan</th>
                                            <th>Qty</th>
                                            <th>Harga</th>
                                            <th>Subtotal</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {layananList.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="no-data">Belum ada layanan</td>
                                            </tr>
                                        ) : (
                                            layananList.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.namaLayanan}</td>
                                                    <td>{item.qty}</td>
                                                    <td>Rp {item.harga.toLocaleString()}</td>
                                                    <td>Rp {item.subtotal.toLocaleString()}</td>
                                                    <td>
                                                        <button 
                                                            className="hapus-button"
                                                            onClick={() => handleHapusLayanan(item.id)}
                                                        >
                                                            ✖
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            {/* Removed the bottom button as it's now in the header */}
        </div>
    );
};

export default Rekammedis;