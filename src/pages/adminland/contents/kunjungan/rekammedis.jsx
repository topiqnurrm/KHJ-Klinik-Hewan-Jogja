import menunggu from './gambar/menunggu.png';
import dirawat from './gambar/inap.png';
import selesai from './gambar/selesai.png';

import React, { useState, useEffect, useRef } from 'react';
import './rekammedis.css';
import {saveRekamMedis, getAllProduk, getAllPelayanan, getRekamMedisByKunjungan,
    createRetribusiPembayaran, updateRetribusiPembayaran, getRetribusiPembayaranByKunjungan,
    updateKunjunganStatus, checkStockSufficiency,
    updateBookingBiaya, updateKunjunganBiaya, getBookingIdByKunjungan
} from '../../../../api/api-aktivitas-rekammedis';

import Popup from '../../admin_nav/popup_nav/popup2';

const Rekammedis = ({ kunjunganData, onBack }) => {

    // Error Message Component
    const ErrorMessage = ({ message, onClose }) => {
        // Check if it's an error or success message based on content
        const isError = message.toLowerCase().includes('gagal') || 
                        message.toLowerCase().includes('error') || 
                        message.toLowerCase().includes('tidak') || 
                        message.toLowerCase().includes('silakan');
        
        const backgroundColor = isError ? 'rgba(244, 67, 54)' : 'rgba(244, 67, 54)';
        
        return (
            <div className={`error-message ${message ? '' : 'fade-out'}`} style={{ backgroundColor }}>
                <span>{message}</span>
            </div>
        );
    };

    // console.log("Formatted kunjungan status data:", formatKunjunganStatusData());

    // Definisikan semua state variables di atas
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
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
    const [popupMessage, setPopupMessage] = useState("");
    
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

    // Helper function to display errors
    const displayError = (message, isSuccess = false) => {
        // If isSuccess is true, append "✓" at the beginning for success messages
        if (isSuccess) {
            message = `✓ ${message}`;
        }
        setErrorMessage(message);
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
    };

    // Setelah semua state didefinsikan, kita bisa menggunakannya
    // Fungsi filter dan handle klik
    const filteredObatOptions = obatOptions.filter(obat => 
        obat.nama.toLowerCase().includes(searchObat.toLowerCase())
    );

    const filteredLayananOptions = layananOptions.filter(layanan => 
        layanan.nama.toLowerCase().includes(searchLayanan.toLowerCase())
    );

    const handleObatSelect = (obatId, obatData) => {
        setSelectedObat(obatId);
        // Create a formatted string that matches the dropdown display
        const displayText = `${obatData.nama} ${obatData.jenis ? `(${obatData.jenis})` : ''} - Stok: ${obatData.stok}`;
        setSearchObat(displayText);
        setIsObatDropdownOpen(false);
    };

    const handleLayananSelect = (layananId, layananData) => {
        setSelectedLayanan(layananId);
        // Create a formatted string that matches the dropdown display
        const displayText = `${layananData.nama} ${layananData.kategori ? `(${layananData.kategori})` : ''}`;
        setSearchLayanan(displayText);
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
            // console.log("Raw produk data:", produkData);
            
            setObatOptions(produkData.map(item => ({
              id: item._id,
              nama: item.nama,
              jenis: item.jenis || "-", // Make sure jenis field is captured
              kategori: item.kategori || "obat", // Make sure kategori field is captured
              harga: parseFloat(item.harga.$numberDecimal || 0),
              stok: parseFloat(item.stok.$numberDecimal || 0) // Tambahkan stok
            })));
            
            // Ambil data pelayanan
            const pelayananData = await getAllPelayanan();
            // console.log("Raw pelayanan data:", pelayananData);
            
            // Make sure each layanan has the kategori field
            setLayananOptions(pelayananData.map(item => ({
              ...item,
              kategori: item.kategori || "layanan medis" // Ensure kategori is set
            })));
            
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
            // console.log("Data kunjungan diterima:", kunjunganData); // Log untuk debugging
            
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
                // console.log("Mengisi keluhan:", kunjunganData.keluhan); // Log untuk debugging
                setRekamMedisData(prev => ({
                    ...prev,
                    keluhan: kunjunganData.keluhan
                }));
            } else {
                // console.log("Tidak ada data keluhan"); // Log untuk debugging
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
                        // console.log("Fetched rekam medis data:", rekamMedisResponse);
                        
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
                            // console.log("Data produk dari rekam medis:", rekamMedisResponse.produks);
                            // console.log("Data obatOptions yang tersedia:", obatOptions);
                            
                            const formattedObatList = rekamMedisResponse.produks.map(produk => {
                                // Handle case where id_produk is populated or just an ID
                                const produkData = typeof produk.id_produk === 'object' ? produk.id_produk : null;
                                const produkId = produkData ? produkData._id : produk.id_produk;
                                
                                // Cari jenis obat dari obatOptions jika tersedia
                                let jenisObat = produk.jenis || "-";
                                
                                // Jika jenisObat masih "-", coba cari dari obatOptions
                                if (jenisObat === "-" || !jenisObat) {
                                    const matchedObat = obatOptions.find(o => o.id === produkId);
                                    if (matchedObat && matchedObat.jenis) {
                                        jenisObat = matchedObat.jenis;
                                        // console.log(`Menemukan jenis ${jenisObat} untuk obat ${matchedObat.nama}`);
                                    } else {
                                        // console.log(`Tidak menemukan jenis untuk produk ID: ${produkId}`);
                                    }
                                }
                                
                                return {
                                    id: Date.now() + Math.random(),
                                    namaObat: produkData ? produkData.nama : "Produk tidak tersedia",
                                    jenis: jenisObat,
                                    qty: produk.jumlah,
                                    harga: parseFloat(produk.harga.$numberDecimal || 0),
                                    subtotal: parseFloat(produk.subtotal_obat.$numberDecimal || 0),
                                    id_produk: produkId,
                                    isExisting: true, // Flag ini penting untuk pengecekan stok
                                    stok_tersedia: null // Tidak perlu stok untuk item yang sudah ada
                                };
                            });
                            // console.log("Formatted obat list with isExisting flag:", formattedObatList);
                            setObatList(formattedObatList.reverse());
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
                        // console.log("No existing rekam medis found for this visit");
                    } else {
                        // console.error("Error fetching rekam medis data:", error);
                    }
                }
            }
        };
        
        fetchRekamMedisData();
    }, [kunjunganData]);

    // Fungsi untuk menambah obat ke list
    const handleTambahObat = () => {
        if (!selectedObat) {
            return;
        }
        
        const obatData = obatOptions.find(o => o.id === selectedObat);
        if (obatData) {
            // Validasi stok
            if (obatData.stok < qtyObat) {
                displayError(`Stok untuk ${obatData.nama} tidak mencukupi. Tersedia: ${obatData.stok}, Diminta: ${qtyObat}`);
                return;
            }

            // Explicitly log these values to verify
            // console.log("Menambahkan obat:", obatData);
            // console.log("Jenis obat yang dipilih:", obatData.jenis || "-");
            // console.log("Kategori obat yang dipilih:", obatData.kategori || "obat");
            
            const newObat = {
                id: Date.now(),
                namaObat: obatData.nama,
                jenis: obatData.jenis || "-",
                kategori: obatData.kategori || "obat",
                qty: qtyObat,
                jumlah: qtyObat,
                harga: obatData.harga,
                subtotal: obatData.harga * qtyObat,
                subtotal_obat: obatData.harga * qtyObat,
                id_produk: obatData.id,
                stok_tersedia: obatData.stok,
                isExisting: false // Pastikan ini selalu false untuk item baru
            };
            
            // console.log("Obat baru ditambahkan ke list (isExisting=false):", newObat);
            setObatList([newObat, ...obatList]);
            setSelectedObat("");
            setSearchObat("");
            setQtyObat(1);
        }
    };

    // Fungsi untuk menambah layanan ke list
    const handleTambahLayanan = () => {
        if (!selectedLayanan) {
            // displayError("Silakan pilih layanan terlebih dahulu");
            return;
        }
        
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
            // setLayananList([...layananList, newLayanan]);
            setLayananList([newLayanan, ...layananList]);
            setSelectedLayanan("");
            setSearchLayanan(""); // Clear the search text
            setQtyLayanan(1);
            
            // displayError(`Layanan ${layananData.nama} berhasil ditambahkan`);
        }
    };

    // Fungsi untuk menghapus obat dari list
    const handleHapusObat = (id) => {
        const obatToDelete = obatList.find(item => item.id === id);
        if (obatToDelete) {
            setObatList(obatList.filter(item => item.id !== id));
            displayError(`Obat ${obatToDelete.namaObat} berhasil dihapus`);
        }
    };

    // Fungsi untuk menghapus layanan dari list
    const handleHapusLayanan = (id) => {
        const layananToDelete = layananList.find(item => item.id === id);
        if (layananToDelete) {
            setLayananList(layananList.filter(item => item.id !== id));
            displayError(`Layanan ${layananToDelete.namaLayanan} berhasil dihapus`);
        }
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
            
            // Hanya validasi obat baru, bukan yang sudah ada di DB
            const newObatItems = obatList.filter(item => item.isExisting === false);
            
            // Jika ada obat baru, validasi stok menggunakan API
            if (newObatItems.length > 0) {
                try {
                    // Format untuk API cek stok
                    const productsForStockCheck = newObatItems.map(item => ({
                        id_produk: item.id_produk,
                        jumlah: item.qty
                    }));
                    
                    // console.log("Memeriksa stok untuk produk baru:", productsForStockCheck);
                    
                    // Periksa stok via API
                    const stockCheckResult = await checkStockSufficiency(productsForStockCheck);
                    
                    if (!stockCheckResult.semua_mencukupi) {
                        // Tampilkan error untuk stok yang tidak mencukupi
                        const insufficientItems = stockCheckResult.detail.filter(item => !item.mencukupi);
                        
                        if (insufficientItems.length > 0) {
                            const errorMsg = `Stok tidak mencukupi untuk: ${insufficientItems[0].nama}: Tersedia ${insufficientItems[0].stok_tersedia}, Diminta ${insufficientItems[0].jumlah_diminta}`;
                            setErrorMessage(errorMsg);
                            setShowError(true);
                            setTimeout(() => setShowError(false), 2000);
                            setIsSaving(false);
                            return;
                        }
                    }
                } catch (stockError) {
                    console.error("Error checking stock via API:", stockError);
                    // Lanjutkan dengan validasi client-side sebagai fallback
                    if (!validateStockLevels()) {
                        setIsSaving(false);
                        return;
                    }
                }
            }
            
            // Jika tidak ada obat baru atau validasi stok berhasil, lanjutkan menyimpan data
            const rekamMedisForDB = formatDataForDB();
            
            // console.log("Data rekam medis yang akan disimpan:", rekamMedisForDB);
            
            // Save rekam medis data
            const response = await saveRekamMedis(rekamMedisForDB);
            
            // console.log("Respon dari server:", response);
            
            // Update kunjungan status
            try {
                // Format data for kunjungan status update
                const kunjunganStatusData = formatKunjunganStatusData();
                
                // Update the kunjungan status
                await updateKunjunganStatus(kunjunganData._id, kunjunganStatusData);
                // console.log("Status kunjungan berhasil diperbarui");
            } catch (kunjunganError) {
                console.error("Error saat mengupdate status kunjungan:", kunjunganError);
                // Continue with other operations
            }
            
            // Handle retribusi pembayaran if status is "menunggu pembayaran" or "selesai"
            if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
                try {
                    // Format data for retribusi pembayaran
                    const retribusiData = formatRetribusiPembayaranData(rekamMedisForDB, kunjunganData._id);
                    
                    // console.log("Data retribusi pembayaran yang akan disimpan:", retribusiData);
                    
                    // Check if retribusi pembayaran already exists for this kunjungan
                    const existingRetribusi = await getRetribusiPembayaranByKunjungan(kunjunganData._id);
                    
                    if (existingRetribusi) {
                        // Update existing retribusi pembayaran
                        await updateRetribusiPembayaran(retribusiData);
                        // console.log("Retribusi pembayaran berhasil diperbarui");
                    } else {
                        // Create new retribusi pembayaran
                        await createRetribusiPembayaran(retribusiData);
                        // console.log("Retribusi pembayaran berhasil dibuat");
                    }
                } catch (retribusiError) {
                    console.error("Error saat menyimpan retribusi pembayaran:", retribusiError);
                    // Continue with success message for rekam medis even if retribusi fails
                }
            }
            
            // alert("Data rekam medis berhasil disimpan!");
            // Kembali ke halaman kunjungan
            onBack();
                    
        // Update kunjungan status
        try {
            const kunjunganStatusData = formatKunjunganStatusData();
            await updateKunjunganStatus(kunjunganData._id, kunjunganStatusData);
        } catch (kunjunganError) {
            console.error("Error saat mengupdate status kunjungan:", kunjunganError);
        }
        
        // Handle retribusi pembayaran and update biaya fields if status is "menunggu pembayaran" or "selesai"
        if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
            try {
                // Calculate grand total
                const totalObat = obatList.reduce((sum, item) => sum + item.subtotal, 0);
                const totalLayanan = layananList.reduce((sum, item) => sum + item.subtotal, 0);
                const grandTotal = totalObat + totalLayanan;
                
                // Format data for retribusi pembayaran
                const retribusiData = formatRetribusiPembayaranData(rekamMedisForDB, kunjunganData._id);
                
                // Update or create retribusi pembayaran
                const existingRetribusi = await getRetribusiPembayaranByKunjungan(kunjunganData._id);
                if (existingRetribusi) {
                    await updateRetribusiPembayaran(retribusiData);
                } else {
                    await createRetribusiPembayaran(retribusiData);
                }
                
                // Update kunjungan biaya field
                try {
                    console.log("Updating kunjungan biaya for ID:", kunjunganData._id, "with amount:", grandTotal);
                    await updateKunjunganBiaya(kunjunganData._id, grandTotal);
                    console.log("Successfully updated kunjungan biaya");
                } catch (kunjunganError) {
                    console.error("Error saat mengupdate biaya kunjungan:", kunjunganError);
                    // Continue with next operations
                }
                
                // Update booking biaya field if available
                try {
                    // First check if this kunjungan has an associated booking ID
                    const bookingId = await getBookingIdByKunjungan(kunjunganData._id);
                    if (bookingId) {
                        console.log("Found booking ID:", bookingId, "- updating biaya");
                        await updateBookingBiaya(bookingId, grandTotal);
                        console.log("Successfully updated booking biaya");
                    } else {
                        console.log("No booking ID found for this kunjungan - skipping booking biaya update");
                    }
                } catch (bookingError) {
                    console.error("Error saat mengupdate biaya booking:", bookingError);
                    // Continue with success message even if updating booking fails
                }
                
            } catch (error) {
                console.error("Error saat memperbarui biaya:", error);
                // Continue with success message
            }
        }
        
        // Success message and return to previous page
        setErrorMessage("Data rekam medis berhasil disimpan!");
        setShowError(true);
        setTimeout(() => {
            setShowError(false);
            onBack();
        }, 2000);
        
        } catch (error) {
            console.error("Error saat menyimpan rekam medis:", error);
            
            // Extract more helpful error messages if available
            let message = "Gagal menyimpan data";
            if (error.response?.data?.message) {
                message += ": " + error.response.data.message;
            }
            if (error.response?.data?.error) {
                message += " - " + error.response.data.error;
            }
            
            setErrorMessage(message);
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
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
    
        // Safe conversion for numeric fields
        let beratBadan = 0;
        if (rekamMedisData.beratBadan && rekamMedisData.beratBadan.toString().trim() !== "") {
            beratBadan = parseFloat(rekamMedisData.beratBadan) || 0;
        }
            
        let suhuBadan = 0;
        if (rekamMedisData.suhuBadan && rekamMedisData.suhuBadan.toString().trim() !== "") {
            suhuBadan = parseFloat(rekamMedisData.suhuBadan) || 0;
        }
    
        // console.log("obatList sebelum diformat:", JSON.stringify(obatList, null, 2));
    
        // Pisahkan obat yang sudah ada (isExisting=true) dan yang baru (isExisting=false)
        const existingProduks = obatList.filter(item => item.isExisting === true);
        const newProduks = obatList.filter(item => item.isExisting === false);
        
        // console.log("Produk yang sudah ada:", existingProduks.length);
        // console.log("Produk baru:", newProduks.length);
        
        // Format produk yang sudah ada
        const formattedExistingProduks = existingProduks.map(item => {
            const jenis = item.jenis || "-";
            const kategori = item.kategori || "obat";
            
            return {
                id_produk: item.id_produk,
                nama: item.namaObat,
                jumlah: item.qty,
                harga: item.harga,
                subtotal_obat: item.subtotal,
                tanggal: new Date(),
                kategori: kategori,
                jenis: jenis,
                isExisting: true // Tandai bahwa ini adalah produk yang sudah ada
            };
        });

        // Format produk baru
        const formattedNewProduks = newProduks.map(item => {
            const jenis = item.jenis || obatOptions.find(o => o.id === item.id_produk)?.jenis || "-";
            const kategori = obatOptions.find(o => o.id === item.id_produk)?.kategori || "obat";
            
            return {
                id_produk: item.id_produk,
                nama: item.namaObat,
                jumlah: item.qty,
                harga: item.harga,
                subtotal_obat: item.subtotal,
                tanggal: new Date(),
                kategori: kategori,
                jenis: jenis,
                isExisting: false // Tandai bahwa ini adalah produk baru
            };
        });

        // Gabungkan kembali
        const formattedProduks = [...formattedExistingProduks, ...formattedNewProduks];
        
        // console.log("Produks setelah diformat:", JSON.stringify(formattedProduks, null, 2));    
    
        // Map layanan list to match pelayanans2 schema
        const formattedPelayanans = layananList.map(item => {
            const layananInfo = layananOptions.find(l => l._id === item.id_pelayanan) || {};
            const kategori = layananInfo.kategori || "layanan medis";
            
            // console.log(`Memformat layanan ${item.namaLayanan} dengan kategori: ${kategori}`);
            
            return {
                id_pelayanan: item.id_pelayanan,
                nama: item.namaLayanan, // Tambahkan nama layanan
                jumlah: item.qty,
                harga: item.harga,
                subtotal_pelayanan: item.subtotal,
                tanggal: new Date(),
                kategori: kategori
            };
        });
        
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
            diagnosa: rekamMedisData.diagnosa || "",
            berat_badan: beratBadan,
            suhu_badan: suhuBadan,
            tanggal: new Date()
        };
    
        // Format main rekam medis data with proper handling for numeric fields
        const finalData = {
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
            dokters: [dokterEntry],
        };
        
        // Final logging untuk memastikan data terformat dengan benar
        // console.log("Data rekam medis final yang akan dikirim:", finalData);
        
        return finalData;
    };

    const handleSubmit = () => {
        // First validate the form
        if (!validateStockLevels()) {
            return; // Stop submission if stock validation fails
        }
        if (!validateForm()) {
            return;
        }
        
        // Set appropriate message based on status
        if (statusPasien === "menunggu pembayaran" || statusPasien === "selesai") {
            setPopupMessage("Apakah yakin ingin menyelesaikan dan memberi status pembayaran data kunjungan ini? Data akan hilang dari kunjungan dan akan ditambahkan di proses selanjutnya 'kasir'.");
            setShowConfirmPopup(true);
        } else if (statusPasien === "dirawat") {
            setPopupMessage("Apakah yakin ingin menyimpan data rekam medis dan mengubah status pasien menjadi dirawat inap? ");
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
            setErrorMessage("Hasil tidak boleh kosong");
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
            return false;
        }
        
        // Check if status is still "menunggu" (not changed)
        if (statusPasien === "menunggu") {
            setErrorMessage("Silahkan pilih status terlebih dahulu");
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
            return false;
        }
        
        // Check if user data is available
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        if (!currentUser._id) {
            setErrorMessage("Data pengguna tidak ditemukan. Silakan login kembali.");
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
            return false;
        }
        
        return true;
    };

    const validateStockLevels = () => {
        let stockValid = true;
        let newItems = obatList.filter(item => item.isExisting === false);
        
        // console.log("Validasi stok hanya untuk item baru:", newItems);
        
        // Hanya validasi stok untuk item BARU (bukan yang sudah ada di DB)
        newItems.forEach(item => {
            const obatData = obatOptions.find(o => o.id === item.id_produk);
            if (obatData && obatData.stok < item.qty) {
                displayError(`Stok untuk ${item.namaObat} tidak mencukupi. Tersedia: ${obatData.stok}, Diminta: ${item.qty}`);
                stockValid = false;
            }
        });
        
        // console.log("Hasil validasi stok:", stockValid);
        return stockValid;
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
            {showError && (
                <ErrorMessage 
                    message={errorMessage} 
                    onClose={() => setShowError(false)} 
                />
            )}
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
                                        <div className="biodata-label">Umur Hewan (tahun)</div>
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
                                        <label>Berat Badan (kg)</label>
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
                                        <label>Suhu Badan (°c)</label>
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
                                        <label>Hasil (berkala)<span className="required">*</span></label>
                                        <textarea 
                                            name="hasil"
                                            value={rekamMedisData.hasil}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan hasil... ke 1 .. ke 2 .."
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
                                            {/* <button 
                                                className={`status-icon ${statusPasien === "menunggu" ? "status-active" : ""}`}
                                                onClick={() => setStatusPasien("menunggu")}
                                                title="Menunggu"
                                                >
                                                <img src={menunggu} alt="Menunggu" />
                                            </button> */}
                                            <button 
                                                className={`status-icon ${statusPasien === "dirawat" ? "status-active" : ""}`}
                                                onClick={() => setStatusPasien("dirawat")}
                                                title="Dirawat"
                                                >
                                                <img src={dirawat} alt="Dirawat" />
                                            </button>
                                            <button 
                                                className={`status-icon ${statusPasien === "menunggu pembayaran" || statusPasien === "selesai" ? "status-active" : ""}`}
                                                onClick={() => setStatusPasien("menunggu pembayaran")}
                                                title="selesai"
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
                                            <div className="input-with-clear">
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
                                                {searchObat && (
                                                    <button 
                                                        className="clear-input-btn" 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent opening dropdown
                                                            setSearchObat("");
                                                            setSelectedObat("");
                                                        }}
                                                        type="button"
                                                    >
                                                        ✖
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isObatDropdownOpen && (
                                            <div className="dropdown-list">
                                                {filteredObatOptions.length > 0 ? (
                                                filteredObatOptions.map(obat => (
                                                    <div 
                                                        key={obat.id} 
                                                        className={`dropdown-item ${obat.stok < 5 ? 'low-stock' : ''}`}
                                                        onClick={() => handleObatSelect(obat.id, obat)}
                                                    >
                                                        {obat.nama} {obat.jenis ? `(${obat.jenis})` : ''} - 
                                                        <span className={obat.stok < 5 ? 'stock-warning' : ''}>
                                                            Stok: {obat.stok}
                                                        </span>
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
                                                <th>Jenis</th>
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
                                                        <td>{item.jenis}</td>
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
                                            <div className="input-with-clear">
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
                                                {searchLayanan && (
                                                    <button 
                                                        className="clear-input-btn" 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent opening dropdown
                                                            setSearchLayanan("");
                                                            setSelectedLayanan("");
                                                        }}
                                                        type="button"
                                                    >
                                                        ✖
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isLayananDropdownOpen && (
                                                <div className="dropdown-list">
                                                    {filteredLayananOptions.length > 0 ? (
                                                        filteredLayananOptions.map(layanan => (
                                                            <div 
                                                                key={layanan._id} 
                                                                className="dropdown-item"
                                                                onClick={() => handleLayananSelect(layanan._id, layanan)}
                                                            >
                                                                {layanan.nama} {layanan.kategori ? `(${layanan.kategori})` : ''}
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
                description={popupMessage}
                onConfirm={handleSimpan}
            />
        </div>
    );
};

export default Rekammedis;