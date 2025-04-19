import React, { useEffect, useState } from "react";
import "./halaman2.css";
import FaEdit from "./gambar/edit.png";
import FaTrash from "./gambar/hapus.png";
import { getPasienByUserId } from "../../../../../../api/api-pasien"; // sesuaikan path

function Halaman2() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [hewanList, setHewanList] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "",
    kategori: "",
    gender: "",
    ras: "",
    umur: ""
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id;

    if (userId) {
      getPasienByUserId(userId).then((data) => {
        setHewanList(data);
        if (data.length > 0) {
          setFormData({
            nama: data[0].nama || "",
            jenis: data[0].jenis || "",
            kategori: data[0].kategori || "",
            gender: data[0].jenis_kelamin || "",
            ras: data[0].ras || "",
            umur: data[0].umur || ""
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (hewanList[selectedIndex]) {
      const selected = hewanList[selectedIndex];
      setFormData({
        nama: selected.nama,
        jenis: selected.jenis,
        kategori: selected.kategori,
        gender: selected.jenis_kelamin,
        ras: selected.ras,
        umur: selected.umur
      });
    }
  }, [selectedIndex, hewanList]);

  const filteredHewanList = hewanList.filter((item) =>
    (item.nama + " " + item.jenis).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hlmhwn2-judul">
      <div className="judul">
        <div className="judul1">
          <h3>Daftar Hewan Saya :</h3>
          <input
            type="text"
            placeholder="Cari hewan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            className="search-input"
          />
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
                className={`hewan-item-baru ${index === selectedIndex ? "aktif" : ""}`}
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
          <div className="form-group">
            <label>Nama Hewan *</label>
            <input name="nama" value={formData.nama} readOnly />
          </div>
          <div className="form-group">
            <label>Jenis Hewan *</label>
            <input name="jenis" value={formData.jenis} readOnly />
          </div>
          <div className="form-group">
            <label>Kategori Hewan *</label>
            <input name="kategori" value={formData.kategori} readOnly />
          </div>
          <div className="form-group">
            <label>Jenis Kelamin Hewan</label>
            <input name="gender" value={formData.gender} readOnly />
          </div>
          <div className="form-group">
            <label>Ras Hewan</label>
            <input name="ras" value={formData.ras} readOnly />
          </div>
          <div className="form-group">
            <label>Umur Hewan (tahun)</label>
            <input name="umur" value={formData.umur} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Halaman2;
