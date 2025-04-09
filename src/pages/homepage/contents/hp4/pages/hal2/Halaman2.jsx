  import React, { useState } from "react";
  import "./halaman2.css";
  // import { FaEdit, FaTrash } from "react-icons/fa";
  import FaEdit from "./gambar/edit.png";
  import FaTrash from "./gambar/hapus.png";

  function Halaman2 () {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hewanList, setHewanList] = useState([
      { nama: "Wowo", jenis: "Kucing" },
      { nama: "Bebeng", jenis: "Kucing" },
    ]);
  
    const [formData, setFormData] = useState({
      nama: "",
      jenis: "",
      kategori: "",
      gender: "",
    });
  
    const handleInputChange = (e) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    return (
      <div className="hlmhwn2-judul">
        <div className="judul">
          <div className="judul1">
            <h3>Daftar Hewan Saya :</h3>
          </div>
          <div className="judul2">
            <h3>Data Rinci Hewan Saya :</h3>
          </div>
        </div>
        <div className="hlmhwn2">
          <div className="daftar-hewan">
            {/* <h3>Daftar Hewan Pengguna :</h3> */}
            <div className="daftar-kartu">
              {hewanList.map((item, index) => (
                <div
                  key={index}
                  className={`hewan-item-baru ${index === selectedIndex ? 'aktif' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <span className="hewan-index-baru">{index + 1}.</span>

                  <div className="hewan-konten">
                    <span className="hewan-nama-baru">{item.nama}, {item.jenis}</span>
                  </div>

                  {index === selectedIndex && (
                    <div className="hewan-aksi-baru">
                      <button className="edit-btn" onClick={() => alert(`Edit ${item.nama}`)}>
                        <img src={FaEdit} alt="Edit" />
                      </button>
                      <button className="hapus-btn" onClick={() => alert(`Hapus ${item.nama}`)}>
                        <img src={FaTrash} alt="Hapus" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button className="tambah-btn">Tambah</button>
            </div>
          </div>
    
          <div className="form-hewan">
            {/* <h3>Data Rinci Pasien :</h3> */}
            <div className="form-group">
              <label>Nama Hewan *</label>
              <input
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Nama Hewan"
              />
            </div>
            <div className="form-group">
              <label>Jenis Hewan *</label>
              <input
                name="jenis"
                value={formData.jenis}
                onChange={handleInputChange}
                placeholder="Jenis Hewan"
              />
            </div>
            <div className="form-group">
              <label>Kategori Hewan *</label>
              <input
                name="jenis"
                value={formData.jenis}
                onChange={handleInputChange}
                placeholder="Kategori Hewan"
              />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin Hewan</label>
              <input
                name="jenis"
                value={formData.jenis}
                onChange={handleInputChange}
                placeholder="Jenis Kelamin Hewan"
              />
            </div>
            <div className="form-group">
              <label>Ras Hewan</label>
              <input
                name="ras"
                value={formData.ras}
                onChange={handleInputChange}
                placeholder="Ras Hewan"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Halaman2;
  