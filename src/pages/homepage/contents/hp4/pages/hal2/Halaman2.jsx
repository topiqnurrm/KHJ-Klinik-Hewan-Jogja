import React, { useEffect, useState } from "react";
import "./halaman2.css";
import FaEdit from "./gambar/edit.png";
import FaTrash from "./gambar/hapus.png";
import { getPasienByUserId } from "../../../../../../api/api-pasien";
import TambahPasien from "../../../../../../components/popup/tambahpasien";

function Halaman2() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hewanList, setHewanList] = useState([]);
  const [filteredHewanList, setFilteredHewanList] = useState([]);
  const [selectedHewan, setSelectedHewan] = useState(null);
  const [showTambahPopup, setShowTambahPopup] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id;

    if (userId) {
      getPasienByUserId(userId).then((data) => {
        // Urutkan dari yang terbaru ke yang lama berdasarkan createdAt
        const sortedData = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setHewanList(sortedData);
        setFilteredHewanList(sortedData);
        if (sortedData.length > 0) {
          setSelectedHewan(sortedData[0]);
        }
      });
    }
  }, []);

  useEffect(() => {
    const filtered = hewanList.filter((item) =>
      (item.nama + " " + item.jenis).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHewanList(filtered);
    if (filtered.length > 0) {
      setSelectedHewan(filtered[0]);
    } else {
      setSelectedHewan(null);
    }
  }, [searchTerm, hewanList]);

  const handleItemClick = (item) => {
    setSelectedHewan(item);
  };

  const handleTambahBerhasil = (dataBaru) => {
    const updatedList = [dataBaru, ...hewanList];
    setHewanList(updatedList);
    setFilteredHewanList(updatedList);
    setSelectedHewan(dataBaru);
  };

  return (
    <div className="hlmhwn2-judul">
      <div className="judul">
        <div className="judul1">
          <h3>Daftar Hewan Saya :</h3>
          <div className="search-wrapper">
          <input
            type="text"
            placeholder="Cari hewan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        </div>
        <div className="judul2">
          <h3>Data Rinci Hewan Saya :</h3>
        </div>
      </div>

      <div className="hlmhwn2">
        <div className="daftar-hewan">
          <div className="daftar-kartu">
            {filteredHewanList.map((item, index) => (
              <div
                key={index}
                className={`hewan-item-baru ${
                  selectedHewan && item._id === selectedHewan._id ? "aktif" : ""
                }`}
                onClick={() => handleItemClick(item)}
              >
                <span className="hewan-index-baru">{index + 1}.</span>
                <div className="hewan-konten">
                  <span className="hewan-nama-baru">
                    {item.nama}, {item.jenis}
                  </span>
                </div>
                {selectedHewan && item._id === selectedHewan._id && (
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

            {/* Tombol Tambah */}
            <button className="tambah-btn" onClick={() => setShowTambahPopup(true)}>Tambah</button>
          </div>
        </div>

        <div className="form-hewan">
          <div className="form-group">
            <label>Nama Hewan *</label>
            <input name="nama" value={selectedHewan?.nama || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Jenis Hewan *</label>
            <input name="jenis" value={selectedHewan?.jenis || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Kategori Hewan *</label>
            <input name="kategori" value={selectedHewan?.kategori || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Jenis Kelamin Hewan</label>
            <input name="gender" value={selectedHewan?.jenis_kelamin || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Ras Hewan</label>
            <input name="ras" value={selectedHewan?.ras || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Umur Hewan (tahun)</label>
            <input name="umur" value={selectedHewan?.umur || ""} readOnly />
          </div>
        </div>
      </div>

      {/* TambahPasien Popup */}
      {showTambahPopup && (
        <TambahPasien
          isOpen={showTambahPopup}
          onClose={() => setShowTambahPopup(false)}
          onSuccess={handleTambahBerhasil}
        />
      )}
    </div>
  );
}

export default Halaman2;
