import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./tambahpasien.css";
import CreatableSelect from "react-select/creatable";

const EditHewan = ({ isOpen, onClose, onSuccess, pasienData }) => {
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "",
    kategori: "",
    ras: "",
    kelamin: "",
    umur: "",
  });
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pasienData) {
      setFormData({
        nama: pasienData.nama || "",
        jenis: pasienData.jenis || "",
        kategori: pasienData.kategori || "",
        ras: pasienData.ras || "",
        kelamin: pasienData.jenis_kelamin || "",
        umur: pasienData.umur || "",
      });
      setInitialData({
        nama: pasienData.nama || "",
        jenis: pasienData.jenis || "",
        kategori: pasienData.kategori || "",
        ras: pasienData.ras || "",
        kelamin: pasienData.jenis_kelamin || "",
        umur: pasienData.umur || "",
      });
    }
  }, [pasienData]);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 2000);
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.jenis || !formData.kategori) {
      return showError("Harap lengkapi semua data wajib (dengan tanda *).");
    }

    if (!hasChanges()) {
      return showError("Tidak ada perubahan data.");
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`http://localhost:5000/api/pasien/${pasienData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedData = await res.json();
        onSuccess(updatedData);
        showSuccess("Data pasien berhasil diperbarui!");
      } else {
        const data = await res.json();
        showError(data.message || "Gagal memperbarui data.");
        setIsSubmitting(false);
      }
    } catch (err) {
      showError("Terjadi kesalahan saat memperbarui data.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="tambahpasien-overlay">
      <div className="tambahpasien-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Data Hewan</h2>

        {error && <div className="tambahpasien-error">{error}</div>}
        {successMessage && <div className="tambahpasien-success">{successMessage}</div>}

        <form className="tambahpasien-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-column">
            <label>Nama Hewan *</label>
            <input
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Nama Hewan"
              className={formData.nama ? "edited" : ""}
            />

            <label>Jenis Hewan *</label>
            <CreatableSelect
              classNamePrefix="react-select"
              options={[
                { value: "anjing", label: "Anjing" },
                { value: "kucing", label: "Kucing" },
                { value: "ayam", label: "Ayam" },
                { value: "kelinci", label: "Kelinci" },
                { value: "burung", label: "Burung" },
              ]}
              isClearable
              isSearchable
              placeholder="Jenis Hewan"
              value={formData.jenis ? { value: formData.jenis, label: formData.jenis } : null}
              onChange={(selectedOption) =>
                setFormData((prev) => ({
                  ...prev,
                  jenis: selectedOption ? selectedOption.value : "",
                }))
              }
            />

            <label>Kategori Hewan *</label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className={formData.kategori ? "edited" : ""}
            >
              <option value="">Pilih Kategori Hewan</option>
              <option value="ternak">Ternak</option>
              <option value="kesayangan / satwa liar">Kesayangan / Satwa Liar</option>
              <option value="unggas">Unggas</option>
            </select>
          </div>

          <div className="form-column">
            <label>Ras Hewan</label>
            <input
              name="ras"
              value={formData.ras}
              onChange={handleChange}
              placeholder="Ras Hewan"
              className={formData.ras ? "edited" : ""}
            />

            <label>Jenis Kelamin Hewan</label>
            <select
              name="kelamin"
              value={formData.kelamin}
              onChange={handleChange}
              className={formData.kelamin ? "edited" : ""}
            >
              <option value="">Pilih Jenis Kelamin Hewan</option>
              <option value="jantan">Jantan</option>
              <option value="betina">Betina</option>
            </select>

            <label>Umur Hewan (tahun)</label>
            <input
              name="umur"
              type="number"
              value={formData.umur}
              onChange={handleChange}
              placeholder="Umur Hewan (tahun)"
              className={formData.umur ? "edited" : ""}
            />
          </div>
        </form>

        <div className="tambahpasien-buttons">
          <button className="btn cancel" onClick={onClose} disabled={isSubmitting}>
            Batal
          </button>
          <button
            className="btn confirm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditHewan;
