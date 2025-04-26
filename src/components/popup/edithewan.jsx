import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CreatableSelect from "react-select/creatable";
import "./tambahpasien.css";

const EditHewan = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sanitizedData = {
      ...initialData,
      kelamin: initialData.jenis_kelamin?.toLowerCase() || "",
      umur:
        initialData.umur !== undefined && initialData.umur !== null
          ? Number(initialData.umur)
          : "",
    };
    setFormData(sanitizedData);
    setOriginalData(sanitizedData);
  }, [initialData]);

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

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const hasChanges = () => {
    return Object.keys(formData).some((key) => {
      return originalData[key] !== formData[key];
    });
  };

  const updateBookingName = async (pasienId, newNamaJenis) => {
    try {
      const res = await fetch(`http://localhost:5000/api/booking/pasien/${pasienId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ namaPasien: newNamaJenis }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal update booking.");
    } catch (err) {
      console.error("Gagal update booking:", err);
      showError(`Gagal update nama di booking: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = ["nama", "jenis", "kategori"];
    
    const missingRequiredFields = requiredFields.filter(
      (field) => !formData[field]
    );
  
    if (missingRequiredFields.length > 0) {
      return showError("Field wajib harus diisi: " + missingRequiredFields.join(", "));
    }
  
    if (!hasChanges()) {
      return showError("Tidak ada perubahan data.");
    }
  
    try {
      setIsSubmitting(true);
  
      const payload = {
        ...formData,
        jenis_kelamin: formData.kelamin,
        nama: formData.nama,
      };
      delete payload.kelamin;
  
      // Use the existing API endpoint to update the pet
      const res = await fetch(
        `http://localhost:5000/api/pasien/${formData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      const result = await res.json();
  
      if (res.ok) {
        showSuccess("Data pasien berhasil diperbarui!");
        onSuccess(result);
      } else {
        showError(result.message || "Gagal memperbarui data.");
      }
    } catch (error) {
      console.error("Error updating pet:", error.response?.data || error);
      showError(`Gagal memperbarui data: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isButtonDisabled = isSubmitting || successMessage;

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
              value={formData.nama || ""}
              onChange={handleChange}
              placeholder="Nama Hewan"
              className={formData.nama !== originalData.nama ? "edited" : ""}
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
              value={
                formData.jenis
                  ? { value: formData.jenis, label: formData.jenis }
                  : null
              }
              onChange={(selectedOption) => handleSelectChange("jenis", selectedOption)}
            />

            <label>Kategori Hewan *</label>
            <select
              name="kategori"
              value={formData.kategori || ""}
              onChange={handleChange}
              className={formData.kategori !== originalData.kategori ? "edited" : ""}
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
              value={formData.ras || ""}
              onChange={handleChange}
              placeholder="Ras Hewan"
              className={formData.ras !== originalData.ras ? "edited" : ""}
            />

            <label>Jenis Kelamin Hewan *</label>
            <select
              name="kelamin"
              value={formData.kelamin || ""}
              onChange={handleChange}
              className={formData.kelamin !== originalData.kelamin ? "edited" : ""}
            >
              <option value="">Pilih Jenis Kelamin Hewan</option>
              <option value="jantan">Jantan</option>
              <option value="betina">Betina</option>
            </select>

            <label>Umur Hewan (tahun) *</label>
            <input
              name="umur"
              type="number"
              step="0.1"
              value={formData.umur || ""}
              onChange={handleChange}
              placeholder="Umur Hewan (tahun)"
              className={formData.umur !== originalData.umur ? "edited" : ""}
            />
          </div>
        </form>

        <div className="tambahpasien-buttons">
          <button
            className="btn cancel"
            onClick={onClose}
            disabled={isButtonDisabled}
          >
            Batal
          </button>
          <button
            className="btn confirm"
            onClick={handleSubmit}
            disabled={isButtonDisabled}
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