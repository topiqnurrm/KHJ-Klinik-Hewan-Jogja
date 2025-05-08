import menunggu from './gambar/menunggu.png';
import dirawat from './gambar/inap.png';
import selesai from './gambar/selesai.png';

import React, { useState, useEffect, useRef } from 'react';
import './rekammedis.css';
import {saveRekamMedis, getAllProduk, getAllPelayanan, getRekamMedisByKunjungan,
    createRetribusiPembayaran, updateRetribusiPembayaran, getRetribusiPembayaranByKunjungan,
    updateKunjunganStatus
} from '../../../../api/api-aktivitas-rekammedis';

import Popup from '../../admin_nav/popup_nav/popup2';

const Rekammedis = ({ kunjunganData, onBack }) => {

    // console.log("Formatted kunjungan status data:", formatKunjunganStatusData());

    // Definisikan semua state variables di atas
    const [isObatDropdownOpen, setIsObatDropdownOpen] = useState(false);
    const [isLayananDropdownOpen, setIsLayananDropdownOpen] = useState(false);
    const [searchObat, setSearchObat] = useState("");
    const [searchLayanan, setSearchLayanan] = useState("");
    const [rekamMedisData, setRekamMedisData] = useState({
        keluhan: "",
        diagnosa: "",
        beratBadan: "",
        suhuBadan: "",
        pemeriksaan: "",
        hasil: ""
    });

    const formatRetribusiPembayaranData = (rekamMedisData, kunjunganId) => {
        // Calculate grand total from all produks and pelayanans
        const totalObat = obatList.reduce((sum, item) => sum + item.subtotal, 0);
        const totalLayanan = layananList.reduce((sum, item) => sum + item.subtotal, 0);
        const grandTotal = totalObat + totalLayanan;
        
        // Get the current logged in user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const userId = currentUser._id;
        
        return {
            grand_total: grandTotal,
            status_retribusi: "menunggu pembayaran",
            id_kunjungan: kunjunganId,
            id_user: userId,
            tanggal: new Date()
        };
    };

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    
    // State untuk obat dan layanan
    const [obatOptions, setObatOptions] = useState([]);
    const [layananOptions, setLayananOptions] = useState([]);
    
    const [selectedObat, setSelectedObat] = useState("");
    const [qtyObat, setQtyObat] = useState(1);
    const [obatList, setObatList] = useState([]);
    
    const [selectedLayanan, setSelectedLayanan] = useState("");
    const [qtyLayanan, setQtyLayanan] = useState(1);
    const [layananList, setLayananList] = useState([]);

    // State untuk status pasien
    const [statusPasien, setStatusPasien] = useState("menunggu");

    // State untuk loading saat menyimpan data
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // State untuk menyimpan kategori hewan untuk menentukan harga layanan
    const [kategoriHewanType, setKategoriHewanType] = useState("");

    // State untuk data pasien yang akan ditampilkan
    const [pasienData, setPasienData] = useState({
        klien: "-",
        namaHewan: "-",
        jenisKelamin: "-",
        kategoriHewan: "-"
    });

    // Tambahkan useRef untuk menangani klik di luar dropdown
    const obatDropdownRef = useRef(null);
    const layananDropdownRef = useRef(null);

    // Setelah semua state didefinsikan, kita bisa menggunakannya
    // Fungsi filter dan handle klik
    const filteredObatOptions = obatOptions.filter(obat => 
        obat.nama.toLowerCase().includes(searchObat.toLowerCase())
    );

    const filteredLayananOptions = layananOptions.filter(layanan => 
        layanan.nama.toLowerCase().includes(searchLayanan.toLowerCase())
    );

    const handleObatSelect = (obatId, obatName) => {
        setSelectedObat(obatId);
        setSearchObat(obatName);
        setIsObatDropdownOpen(false);
    };

    const handleLayananSelect = (layananId, layananName) => {
        setSelectedLayanan(layananId);
        setSearchLayanan(layananName);
        setIsLayananDropdownOpen(false);
    };

    // Effect untuk menutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (obatDropdownRef.current && !obatDropdownRef.current.contains(event.target)) {
                setIsObatDropdownOpen(false);
            }
            if (layananDropdownRef.current && !layananDropdownRef.current.contains(event.target)) {
                setIsLayananDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fungsi untuk menentukan kategori hewan (ternak, kesayangan_satwaliar, unggas)
    const determineKategoriType = (kategori) => {
        kategori = kategori ? kategori.toLowerCase() : "";
        
        // Kategori untuk ternak
        if (kategori.includes('sapi') || kategori.includes('kambing') || 
            kategori.includes('domba') || kategori.includes('kerbau') ||
            kategori.includes('kuda') || kategori.includes('ternak')) {
            return 'ternak';
        }
        
        // Kategori untuk unggas
        else if (kategori.includes('ayam') || kategori.includes('bebek') || 
                kategori.includes('angsa') || kategori.includes('burung') ||
                kategori.includes('unggas')) {
            return 'unggas';
        }
        
        // Default kategori kesayangan/satwa liar
        else {
            return 'kesayangan_satwaliar';
        }
    };

    // Mengambil data produk dan pelayanan saat komponen dimuat
    useEffect(() => {
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        if (!currentUser._id) {
            console.warn("User data not found in localStorage");
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Ambil data produk
                const produkData = await getAllProduk();
                setObatOptions(produkData.map(item => ({
                    id: item._id,
                    nama: item.nama,
                    harga: parseFloat(item.harga.$numberDecimal || 0)
                })));
                
                // Ambil data pelayanan
                const pelayananData = await getAllPelayanan();
                setLayananOptions(pelayananData);
                
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Mengisi data pasien saat komponen dimuat atau kunjunganData berubah
    useEffect(() => {
        if (kunjunganData) {
            console.log("Data kunjungan diterima:", kunjunganData); // Log untuk debugging
            
            // Format nama hewan dengan jenis jika tersedia
            let formattedNamaHewan = kunjunganData.nama_hewan || "-";
            
            // Extract possible jenis from the nama_hewan if it's in the format "Name (Type)"
            let kategoriHewan = "-";
            
            // Prioritaskan penggunaan field kategori langsung jika tersedia
            if (kunjunganData.kategori && kunjunganData.kategori.trim() !== "") {
                kategoriHewan = kunjunganData.kategori;
            } 
            // Jika tidak ada field kategori, cek jika nama hewan berisi informasi kategori di dalam kurung
            else if (formattedNamaHewan !== "-" && formattedNamaHewan.includes("(")) {
                const parts = formattedNamaHewan.split("(");
                if (parts.length >= 2) {
                    kategoriHewan = parts[1].replace(")", "").trim();
                }
            } 
            // Sebagai fallback, gunakan field jenis jika tersedia
            else if (kunjunganData.jenis) {
                kategoriHewan = kunjunganData.jenis;
            }
            
            // Menentukan tipe kategori untuk harga layanan
            const kategoriType = determineKategoriType(kategoriHewan);
            setKategoriHewanType(kategoriType);
            
            // Set data pasien
            setPasienData({
                klien: kunjunganData.klien || "-",
                namaHewan: formattedNamaHewan || "-",
                jenisKelamin: kunjunganData.jenis_kelamin || "-",
                kategoriHewan: kategoriHewan
            });

            // Pre-fill keluhan if available in kunjunganData and make it read-only
            if (kunjunganData.keluhan) {
                console.log("Mengisi keluhan:", kunjunganData.keluhan); // Log untuk debugging
                setRekamMedisData(prev => ({
                    ...prev,
                    keluhan: kunjunganData.keluhan
                }));
            } else {
                console.log("Tidak ada data keluhan"); // Log untuk debugging
            }
            
            // Set status pasien berdasarkan status kunjungan
            if (kunjunganData.status) {
                if (kunjunganData.status === "dirawat inap") {
                    setStatusPasien("dirawat");
                } else if (kunjunganData.status === "selesai") {
                    setStatusPasien("menunggu pembayaran");
                } else {
                    // Untuk status lain, default ke "menunggu"
                    setStatusPasien("menunggu");
                }
            } else {
                // Default ke "menunggu" jika tidak ada status
                setStatusPasien("menunggu");
            }
        }
    }, [kunjunganData]);

    useEffect(() => {
        const fetchRekamMedisData = async () => {
            if (kunjunganData && kunjunganData._id) {
                try {
                    // Fetch existing rekam medis data for this visit
                    const rekamMedisResponse = await getRekamMedisByKunjungan(kunjunganData._id);
                    
                    // If data exists, populate form fields
                    if (rekamMedisResponse) {
                        console.log("Fetched rekam medis data:", rekamMedisResponse);
                        
                        // Format values for form fields
                        setRekamMedisData({
                            keluhan: rekamMedisResponse.keluhan || kunjunganData.keluhan || "",
                            diagnosa: rekamMedisResponse.diagnosa || "",
                            beratBadan: rekamMedisResponse.berat_badan?.$numberDecimal || "",
                            suhuBadan: rekamMedisResponse.suhu_badan?.$numberDecimal || "",
                            pemeriksaan: rekamMedisResponse.pemeriksaan || "",
                            hasil: rekamMedisResponse.hasil || ""
                        });
                        
                        // Set status pasien based on the latest data
                        if (rekamMedisResponse.dokters && rekamMedisResponse.dokters.length > 0) {
                            const latestDokter = rekamMedisResponse.dokters.sort((a, b) => 
                                new Date(b.tanggal) - new Date(a.tanggal))[0];
                                
                            if (latestDokter.status === "dirawat inap") {
                                setStatusPasien("dirawat");
                            } else if (latestDokter.status === "menunggu pembayaran") {
                                setStatusPasien("selesai");
                            } else {
                                setStatusPasien("menunggu");
                            }
                        }
                        
                        // Load medications from existing data
                        if (rekamMedisResponse.produks && rekamMedisResponse.produks.length > 0) {
                            const formattedObatList = rekamMedisResponse.produks.map(produk => {
                                // Handle case where id_produk is populated or just an ID
                                const produkData = typeof produk.id_produk === 'object' ? produk.id_produk : null;
                                
                                return {
                                    id: Date.now() + Math.random(), // Generate a unique ID
                                    namaObat: produkData ? produkData.nama : "Produk tidak tersedia",
                                    qty: produk.jumlah,
                                    harga: parseFloat(produk.harga.$numberDecimal || 0),
                                    subtotal: parseFloat(produk.subtotal_obat.$numberDecimal || 0),
                                    id_produk: produkData ? produkData._id : produk.id_produk
                                };
                            });
                            setObatList(formattedObatList);
                        }
                        
                        // Load services from existing data
                        if (rekamMedisResponse.pelayanans2 && rekamMedisResponse.pelayanans2.length > 0) {
                            const formattedLayananList = rekamMedisResponse.pelayanans2.map(pelayanan => {
                                // Handle case where id_pelayanan is populated or just an ID
                                const pelayananData = typeof pelayanan.id_pelayanan === 'object' ? pelayanan.id_pelayanan : null;
                                
                                return {
                                    id: Date.now() + Math.random(), // Generate a unique ID
                                    namaLayanan: pelayananData ? pelayananData.nama : "Layanan tidak tersedia",
                                    qty: pelayanan.jumlah,
                                    harga: parseFloat(pelayanan.harga.$numberDecimal || 0),
                                    subtotal: parseFloat(pelayanan.subtotal_pelayanan.$numberDecimal || 0),
                                    id_pelayanan: pelayananData ? pelayananData._id : pelayanan.id_pelayanan
                                };
                            });
                            setLayananList(formattedLayananList);
                        }
                    }
                } catch (error) {
                    // If 404, it means there's no existing rekam medis for this visit
                    if (error.response && error.response.status === 404) {
                        console.log("No existing rekam medis found for this visit");
                    } else {
                        console.error("Error fetching rekam medis data:", error);
                    }
                }
            }
        };
        
        fetchRekamMedisData();
    }, [kunjunganData]);

    // Fungsi untuk menambah obat ke list
    const handleTambahObat = () => {
        if (selectedObat) {
            const obatData = obatOptions.find(o => o.id === selectedObat);
            if (obatData) {
                const newObat = {
                    id: Date.now(), // Unique ID for the item
                    namaObat: obatData.nama,
                    qty: qtyObat,
                    harga: obatData.harga,
                    subtotal: obatData.harga * qtyObat,
                    id_produk: obatData.id // Menyimpan ID MongoDB
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
            const layananData = layananOptions.find(l => l._id === selectedLayanan);
            if (layananData) {
                // Pilih harga berdasarkan kategori hewan
                let harga = 0;
                
                if (kategoriHewanType === 'ternak') {
                    harga = parseFloat(layananData.harga_ternak.$numberDecimal || 0);
                } else if (kategoriHewanType === 'unggas') {
                    harga = parseFloat(layananData.harga_unggas.$numberDecimal || 0);
                } else {
                    harga = parseFloat(layananData.harga_kesayangan_satwaliar.$numberDecimal || 0);
                }
                
                const newLayanan = {
                    id: Date.now(), // Unique ID for the item
                    namaLayanan: layananData.nama,
                    qty: qtyLayanan,
                    harga: harga,
                    subtotal: harga * qtyLayanan,
                    id_pelayanan: layananData._id // Menyimpan ID MongoDB
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

    // Handle input changes for all fields except keluhan
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Only update if the field is not keluhan
        if (name !== "keluhan") {
            setRekamMedisData({
                ...rekamMedisData,
                [name]: value
            });
        }
    };

    const formatKunjunganStatusData = () => {
        // Get the current logged in user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const userId = currentUser._id;
        
        // Map status pasien to status_kunjungan
        let statusKunjungan = "";
        
        if (statusPasien === "menunggu") {
            statusKunjungan = "sedang diperiksa";
        } else if (statusPasien === "dirawat") {
            statusKunjungan = "dirawat inap";
        } else if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
            statusKunjungan = "menunggu pembayaran";
        }
        
        // Create new administrasi entry
        const newAdministrasi = {
            id_user: userId,
            catatan: "diperiksa",
            status_kunjungan: statusKunjungan,
            tanggal: new Date()
        };
        
        return {
            administrasis2: [newAdministrasi],
            status_kunjungan: statusKunjungan
        };
    };

    const handleSimpan = async () => {
        try {
            setIsSaving(true);
            const rekamMedisForDB = formatDataForDB();
            
            console.log("Data rekam medis yang akan disimpan:", rekamMedisForDB);
            
            // Save rekam medis data
            const response = await saveRekamMedis(rekamMedisForDB);
            
            console.log("Respon dari server:", response);
            
            // Update kunjungan status
            try {
                // Format data for kunjungan status update
                const kunjunganStatusData = formatKunjunganStatusData();
                
                // Update the kunjungan status
                await updateKunjunganStatus(kunjunganData._id, kunjunganStatusData);
                console.log("Status kunjungan berhasil diperbarui");
            } catch (kunjunganError) {
                console.error("Error saat mengupdate status kunjungan:", kunjunganError);
                // Continue with other operations
            }
            
            // Handle retribusi pembayaran if status is "menunggu pembayaran" or "selesai"
            if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
                try {
                    // Format data for retribusi pembayaran
                    const retribusiData = formatRetribusiPembayaranData(rekamMedisForDB, kunjunganData._id);
                    
                    console.log("Data retribusi pembayaran yang akan disimpan:", retribusiData);
                    
                    // Check if retribusi pembayaran already exists for this kunjungan
                    const existingRetribusi = await getRetribusiPembayaranByKunjungan(kunjunganData._id);
                    
                    if (existingRetribusi) {
                        // Update existing retribusi pembayaran
                        await updateRetribusiPembayaran(retribusiData);
                        console.log("Retribusi pembayaran berhasil diperbarui");
                    } else {
                        // Create new retribusi pembayaran
                        await createRetribusiPembayaran(retribusiData);
                        console.log("Retribusi pembayaran berhasil dibuat");
                    }
                } catch (retribusiError) {
                    console.error("Error saat menyimpan retribusi pembayaran:", retribusiError);
                    // Continue with success message for rekam medis even if retribusi fails
                }
            }
            
            alert("Data rekam medis berhasil disimpan!");
            // Kembali ke halaman kunjungan
            onBack();
            
        } catch (error) {
            console.error("Error saat menyimpan rekam medis:", error);
            
            // Extract more helpful error messages if available
            let errorMessage = "Gagal menyimpan data";
            if (error.response?.data?.message) {
                errorMessage += ": " + error.response.data.message;
            }
            if (error.response?.data?.error) {
                errorMessage += "\nDetail: " + error.response.data.error;
            }
            
            alert(errorMessage);
        } finally {
            setIsSaving(false);
            // Close popup if it was open
            setShowConfirmPopup(false);
        }
    };

    // Format data for DB according to schema
    const formatDataForDB = () => {
        // Get the current logged in user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const userId = currentUser._id;
    
        // Map obat list to match produks schema
        const formattedProduks = obatList.map(item => ({
            id_produk: item.id_produk,
            jumlah: item.qty,
            harga: item.harga,
            subtotal_obat: item.subtotal,
            tanggal: new Date()
        }));
    
        // Map layanan list to match pelayanans2 schema
        const formattedPelayanans = layananList.map(item => ({
            id_pelayanan: item.id_pelayanan,
            jumlah: item.qty,
            harga: item.harga,
            subtotal_pelayanan: item.subtotal,
            tanggal: new Date()
        }));
        
        // Mapping status pasien ke status kunjungan dan status dalam dokter
        let statusKunjungan = "";
        let dokterStatus = "";
        
        if (statusPasien === "menunggu") {
            statusKunjungan = "sedang diperiksa";
            dokterStatus = "sedang diperiksa";
        } else if (statusPasien === "dirawat") {
            statusKunjungan = "dirawat inap";
            dokterStatus = "dirawat inap";
        } else if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
            statusKunjungan = "menunggu pembayaran";
            dokterStatus = "menunggu pembayaran";
        }
    
        // Create dokters entry with the current user
        const dokterEntry = {
            id_user: userId,
            status: dokterStatus,
            hasil: rekamMedisData.hasil,
            tanggal: new Date()
        };
    
        // Safe conversion for numeric fields - ensure we use a non-null value if the field is empty
        let beratBadan = 0;
        if (rekamMedisData.beratBadan && rekamMedisData.beratBadan.toString().trim() !== "") {
            beratBadan = parseFloat(rekamMedisData.beratBadan) || 0;
        }
            
        let suhuBadan = 0;
        if (rekamMedisData.suhuBadan && rekamMedisData.suhuBadan.toString().trim() !== "") {
            suhuBadan = parseFloat(rekamMedisData.suhuBadan) || 0;
        }
            
        // Format main rekam medis data with proper handling for numeric fields
        return {
            diagnosa: rekamMedisData.diagnosa || "",
            keluhan: rekamMedisData.keluhan || "",
            berat_badan: beratBadan,  // Always send a number, not null
            suhu_badan: suhuBadan,    // Always send a number, not null
            pemeriksaan: rekamMedisData.pemeriksaan || "",
            hasil: rekamMedisData.hasil || "",
            tanggal: new Date(),
            id_kunjungan: kunjunganData?._id,
            status: statusKunjungan,
            status_booking: statusKunjungan,
            produks: formattedProduks,
            pelayanans2: formattedPelayanans,
            dokters: [dokterEntry]
        };
    };

    const handleSubmit = () => {
        // First validate the form
        if (!validateForm()) {
            return;
        }
        
        // If status is "menunggu pembayaran" or "selesai", show popup confirmation
        if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
            setShowConfirmPopup(true);
        } else {
            // For other statuses, proceed with saving directly
            handleSimpan();
        }
    };

    // Validate form before saving
    const validateForm = () => {
        // Update validation - hasil is required instead of diagnosa
        if (!rekamMedisData.hasil.trim()) {
            alert("Hasil tidak boleh kosong");
            return false;
        }
        
        // Check if user data is available
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        if (!currentUser._id) {
            alert("Data pengguna tidak ditemukan. Silakan login kembali.");
            return false;
        }
        
        return true;
    };

    return (
        <div className='rekammedis-container'>
            <div className="dashboard-header">
                <div className="header-with-back">
                    <h1>
                        Aktivitas &gt; <span className="navigation-link" onClick={onBack}>Kunjungan</span> &gt; Rekam Medis - {pasienData.namaHewan}
                    </h1>
                    <button 
                        className="simpan-button" 
                        onClick={handleSubmit} 
                        disabled={isSaving}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                    </button>
                </div>
            </div>
            
            <div className="rekammedis-content">
                {isLoading ? (
                    <div className="loading-indicator">Loading data...</div>
                ) : (
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
                                        <div className="biodata-value">{pasienData.klien}</div>
                                    </div>
                                    <div className="biodata-row">
                                        <div className="biodata-label">Nama Pasien</div>
                                        <div className="biodata-separator">:</div>
                                        <div className="biodata-value">{pasienData.namaHewan}</div>
                                    </div>
                                    <div className="biodata-row">
                                        <div className="biodata-label">Jenis Kelamin Hewan</div>
                                        <div className="biodata-separator">:</div>
                                        <span>{kunjunganData.jenis_kelamin || '-'}</span>
                                    </div>
                                    
                                    <div className="biodata-row">
                                        <div className="biodata-label">Kategori Hewan</div>
                                        <div className="biodata-separator">:</div>
                                        <div className="biodata-value">{pasienData.kategoriHewan}</div>
                                    </div>
                                    <div className="biodata-row">
                                        <div className="biodata-label">Ras Hewan</div>
                                        <div className="biodata-separator">:</div>
                                        <span>{kunjunganData.ras || '-'}</span>
                                    </div>
                                    <div className="biodata-row">
                                        <div className="biodata-label">Umur Hewan</div>
                                        <div className="biodata-separator">:</div>
                                        <span>{kunjunganData.umur || '-'}</span>
                                    </div>
                                    <div className="biodata-row">
                                        <div className="biodata-label">Jenis Layanan</div>
                                        <div className="biodata-separator">:</div>
                                        <span>{kunjunganData.jenis_layanan || '-'}</span>
                                    </div>
                                    <div className="biodata-row">
                                        <div className="biodata-label">Layanan Dipilih</div>
                                        <div className="biodata-separator">:</div>
                                        <span>{kunjunganData.layanan || '-'}</span>
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
                                            placeholder="Keluhan pasien..."
                                            readOnly
                                            className="readonly-textarea"
                                        ></textarea>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Berat Badan</label>
                                        <input 
                                            type="number" 
                                            name="beratBadan"
                                            value={rekamMedisData.beratBadan}
                                            onChange={handleInputChange}
                                            placeholder="Kg"
                                            step="0.01"
                                            min="0"
                                            max="999999.99"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Suhu Badan</label>
                                        <input 
                                            type="number" 
                                            name="suhuBadan"
                                            value={rekamMedisData.suhuBadan}
                                            onChange={handleInputChange}
                                            placeholder="°C"
                                            step="0.01"
                                            min="0"
                                            max="99999.99"
                                        />
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
                                    {/* <div className="form-group">
                                        <label>Pemeriksaan</label>
                                        <textarea 
                                            name="pemeriksaan"
                                            value={rekamMedisData.pemeriksaan}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan hasil pemeriksaan..."
                                        ></textarea>
                                    </div> */}
                                    <div className="form-group">
                                        <label>Hasil <span className="required">*</span></label>
                                        <textarea 
                                            name="hasil"
                                            value={rekamMedisData.hasil}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan hasil..."
                                            required
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
                                                className={`status-icon ${statusPasien === "menunggu pembayaran" || statusPasien === "selesai" ? "status-active" : ""}`}
                                                onClick={() => setStatusPasien("menunggu pembayaran")}
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
                                
                                {/* Pemakaian Obat dan Layanan */}
                                <div className="obat-content">
                                    <div className="obat-header">
                                        <h3>Obat</h3>
                                        <div className="obat-add">
                                            <button className="tambah-button" onClick={handleTambahObat}>+ Tambah</button>
                                        </div>
                                    </div>
                                    
                                    <div className="obat-selection">
                                        <div className="dropdown-container" ref={obatDropdownRef}>
                                            <input
                                                type="text"
                                                placeholder="Cari obat..."
                                                value={searchObat}
                                                onChange={(e) => {
                                                    setSearchObat(e.target.value);
                                                    setIsObatDropdownOpen(true);
                                                }}
                                                onClick={() => setIsObatDropdownOpen(true)}
                                                className="dropdown-input"
                                            />
                                            
                                            {isObatDropdownOpen && (
                                                <div className="dropdown-list">
                                                    {filteredObatOptions.length > 0 ? (
                                                        filteredObatOptions.map(obat => (
                                                            <div 
                                                                key={obat.id} 
                                                                className="dropdown-item"
                                                                onClick={() => handleObatSelect(obat.id, obat.nama)}
                                                            >
                                                                {obat.nama}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="no-results">Tidak ada hasil</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="qty-input-container">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={qtyObat} 
                                                onChange={(e) => setQtyObat(parseInt(e.target.value) || 1)}
                                                className="qty-input"
                                            />
                                            <div className="qty-buttons">
                                                <button 
                                                    className="qty-btn qty-up" 
                                                    onClick={() => setQtyObat(prev => prev + 1)}
                                                    type="button"
                                                >
                                                    ▲
                                                </button>
                                                <button 
                                                    className="qty-btn qty-down" 
                                                    onClick={() => setQtyObat(prev => prev > 1 ? prev - 1 : 1)}
                                                    type="button"
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Tambahkan tabel obat di sini */}
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
                                
                                {/* layanan */}
                                <div className="layanan-content">
                                    <div className="layanan-header">
                                        <h3>Layanan</h3>
                                        <div className="layanan-add">
                                            <button className="tambah-button" onClick={handleTambahLayanan}>+ Tambah</button>
                                        </div>
                                    </div>
                                    
                                    <div className="layanan-selection">
                                        <div className="dropdown-container" ref={layananDropdownRef}>
                                            <input
                                                type="text"
                                                placeholder="Cari layanan..."
                                                value={searchLayanan}
                                                onChange={(e) => {
                                                    setSearchLayanan(e.target.value);
                                                    setIsLayananDropdownOpen(true);
                                                }}
                                                onClick={() => setIsLayananDropdownOpen(true)}
                                                className="dropdown-input"
                                            />
                                            
                                            {isLayananDropdownOpen && (
                                                <div className="dropdown-list">
                                                    {filteredLayananOptions.length > 0 ? (
                                                        filteredLayananOptions.map(layanan => (
                                                            <div 
                                                                key={layanan._id} 
                                                                className="dropdown-item"
                                                                onClick={() => handleLayananSelect(layanan._id, layanan.nama)}
                                                            >
                                                                {layanan.nama}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="no-results">Tidak ada hasil</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="qty-input-container">
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={qtyLayanan} 
                                                onChange={(e) => setQtyLayanan(parseInt(e.target.value) || 1)}
                                                className="qty-input"
                                            />
                                            <div className="qty-buttons">
                                                <button 
                                                    className="qty-btn qty-up" 
                                                    onClick={() => setQtyLayanan(prev => prev + 1)}
                                                    type="button"
                                                >
                                                    ▲
                                                </button>
                                                <button 
                                                    className="qty-btn qty-down" 
                                                    onClick={() => setQtyLayanan(prev => prev > 1 ? prev - 1 : 1)}
                                                    type="button"
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Tambahkan tabel layanan di sini */}
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
                )}
            </div>
            <Popup 
                isOpen={showConfirmPopup}
                onClose={() => setShowConfirmPopup(false)}
                title="Konfirmasi"
                description="Apakah yakin ingin menyelesaikan dan memberi status pembayaran data kunjungan ini? Data akan hilang dari kunjungan dan akan ditambahkan di proses selanjutnya 'kasir'."
                onConfirm={handleSimpan}
            />
        </div>
    );
};

export default Rekammedis;