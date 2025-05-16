import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './EditRetribusi.css';
import { updateStatusPembayaran, getPembayaranDetail } from '../../../../api/api-aktivitas-kasir';
import Popup2 from '../../admin_nav/popup_nav/popup2';

import printJS from 'print-js'; // Add this import

import retribusiImg from './images/retribusi.png';
import rekamMedisImg from './images/rekammedis.png';

const EditRetribusi = ({ pembayaranItem, onClose, onUpdate }) => {
    const [detailData, setDetailData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [dokters, setDokters] = useState([]);
    const [produks, setProduks] = useState([]);
    const [pelayanans, setPelayanans] = useState([]);
    const [totalObat, setTotalObat] = useState(0);
    const [totalPelayanan, setTotalPelayanan] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [formData, setFormData] = useState({
        status_retribusi: 'menunggu pembayaran',
        metode_bayar: 'cash',
        jumlah_pembayaran: 0,
        kembali: 0
    });
    const [isConfirmed, setIsConfirmed] = useState(false); // State for tracking confirmation
    const [showConfirmation, setShowConfirmation] = useState(false); // State for handling confirmation
    const [showSelesaiConfirmation, setShowSelesaiConfirmation] = useState(false); // For selesai confirmation
    const [currentDateTime, setCurrentDateTime] = useState('');

    // State untuk melacak ketersediaan portal
    const [portalElement, setPortalElement] = useState(null);
    
    // Cek ketersediaan portal dan buat jika belum ada
    useEffect(() => {
        let element = document.getElementById('portal-root');
        
        // Jika portal-root tidak ada, buat element baru
        if (!element) {
            element = document.createElement('div');
            element.id = 'portal-root';
            document.body.appendChild(element);
        }
        
        setPortalElement(element);
        
        // Set current date time
        const now = new Date();
        setCurrentDateTime(now.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
        
        // Cleanup saat komponen unmount
        return () => {
            // Jika portal dibuat oleh komponen ini dan sudah tidak digunakan, hapus
            if (element && element.parentNode && !element.hasChildNodes()) {
                element.parentNode.removeChild(element);
            }
        };
    }, []);

    // Fetch payment details when component mounts
    useEffect(() => {
        fetchPembayaranDetail();
    }, []);

    // Fix for fetchPembayaranDetail function in EditRetribusi.jsx
    const fetchPembayaranDetail = async () => {
        try {
            setIsLoading(true);
            const data = await getPembayaranDetail(pembayaranItem._id);
            setDetailData(data);
            // console.log("Raw data from API:", data); // Debug log
            
            // Calculate totals from data
            let totalHargaObat = 0;
            let totalHargaPelayanan = 0;
            
            // Cek dan set data rekam medis
            if (data.rekam_medis) {
                // FIXED: Filter dokters to include only those with "dokter" role
                if (data.rekam_medis.dokters && Array.isArray(data.rekam_medis.dokters)) {
                    // Only include doctors with aktor="dokter"
                    const filteredDokters = data.rekam_medis.dokters.filter(
                        d => d.id_user && d.id_user.aktor === 'dokter'
                    );
                    // console.log("Filtered doctors:", filteredDokters);
                    setDokters(filteredDokters);
                }
                
                if (data.rekam_medis.produks && Array.isArray(data.rekam_medis.produks)) {
                    setProduks(data.rekam_medis.produks);
                    // Hitung total obat - handle Decimal128 format
                    totalHargaObat = data.rekam_medis.produks.reduce(
                        (sum, produk) => {
                            const subtotal = produk.subtotal_obat && produk.subtotal_obat.$numberDecimal 
                                ? parseFloat(produk.subtotal_obat.$numberDecimal) 
                                : 0;
                            return sum + subtotal;
                        }, 
                        0
                    );
                    setTotalObat(totalHargaObat);
                }
                
                if (data.rekam_medis.pelayanans2 && Array.isArray(data.rekam_medis.pelayanans2)) {
                    setPelayanans(data.rekam_medis.pelayanans2);
                    // Hitung total pelayanan - handle Decimal128 format
                    totalHargaPelayanan = data.rekam_medis.pelayanans2.reduce(
                        (sum, pelayanan) => {
                            const subtotal = pelayanan.subtotal_pelayanan && pelayanan.subtotal_pelayanan.$numberDecimal 
                                ? parseFloat(pelayanan.subtotal_pelayanan.$numberDecimal) 
                                : 0;
                            return sum + subtotal;
                        }, 
                        0
                    );
                    setTotalPelayanan(totalHargaPelayanan);
                }
            }
            
            // FIXED: Get jenis_layanan properly
            let jenisLayanan = '';
            if (data.jenis_layanan && data.jenis_layanan !== '') {
                jenisLayanan = data.jenis_layanan;
            } else if (data.id_kunjungan && data.id_kunjungan.jenis_layanan) {
                jenisLayanan = data.id_kunjungan.jenis_layanan;
            }
            // console.log("Jenis layanan found:", jenisLayanan);
            
            // Parse grand_total from Decimal128 format
            let total = 0;
            if (data.grand_total) {
                if (data.grand_total.$numberDecimal) {
                    total = parseFloat(data.grand_total.$numberDecimal);
                } else if (typeof data.grand_total === 'string') {
                    total = parseFloat(data.grand_total);
                } else if (typeof data.grand_total === 'number') {
                    total = data.grand_total;
                }
            }
            // console.log("Parsed grand_total:", total); // Debug log
            setGrandTotal(total);
            
            // Parse jumlah_pembayaran from any possible format
            let pembayaran = 0;
            if (data.jumlah_pembayaran) {
                if (data.jumlah_pembayaran.$numberDecimal) {
                    pembayaran = parseFloat(data.jumlah_pembayaran.$numberDecimal);
                } else if (typeof data.jumlah_pembayaran === 'string') {
                    pembayaran = parseFloat(data.jumlah_pembayaran);
                } else if (typeof data.jumlah_pembayaran === 'number') {
                    pembayaran = data.jumlah_pembayaran;
                }
            }
            // console.log("Parsed jumlah_pembayaran:", pembayaran); // Debug log
            
            // Parse kembali from Decimal128 format
            let kembalian = 0;
            if (data.kembali) {
                if (data.kembali.$numberDecimal) {
                    kembalian = parseFloat(data.kembali.$numberDecimal);
                } else if (typeof data.kembali === 'string') {
                    kembalian = parseFloat(data.kembali);
                } else if (typeof data.kembali === 'number') {
                    kembalian = data.kembali;
                }
            }
            // console.log("Parsed kembali:", kembalian); // Debug log
            
            // First define initialKembali before using it
            let initialKembali = kembalian;
            if (initialKembali <= 0 && pembayaran > 0) {
                // If there's payment but no change recorded, calculate it
                initialKembali = Math.max(0, pembayaran - total);
            }
            
            // Now we can use initialKembali safely
            let initialJumlahPembayaran = pembayaran;
            if (initialJumlahPembayaran <= 0) {
                // If no payment recorded but we have change recorded,
                // calculate payment as total + change
                if (initialKembali > 0) {
                    initialJumlahPembayaran = total + initialKembali;
                } else {
                    // Otherwise default to just the total
                    initialJumlahPembayaran = total;
                }
            }
            
            // console.log("Setting form data:", {
            //     status_retribusi: data.status_retribusi || 'menunggu pembayaran',
            //     metode_bayar: data.metode_bayar || 'cash',
            //     jumlah_pembayaran: initialJumlahPembayaran,
            //     kembali: initialKembali
            // }); // Debug log
            
            setFormData({
                status_retribusi: data.status_retribusi || 'menunggu pembayaran',
                metode_bayar: data.metode_bayar || 'cash',
                jumlah_pembayaran: initialJumlahPembayaran,
                kembali: initialKembali
            });
            
            // IMPROVED LOGIC: Set isConfirmed to true if:
            // 1. Pembayaran is greater than 0 AND Kembalian is not 0 OR
            // 2. Status retribusi is not "menunggu pembayaran"

            const hasPaymentAmount = pembayaran > 0;
            const hasChangeAmount = kembalian >= 0;
            const hasNonWaitingStatus = data.status_retribusi && 
                data.status_retribusi !== 'menunggu pembayaran';
            const hasMetodeBayar = data.metode_bayar && data.metode_bayar !== '';

            // More lenient condition - any sign of payment processing should enable confirmation
            setIsConfirmed(hasPaymentAmount || hasNonWaitingStatus || (hasChangeAmount && hasMetodeBayar));

            // Add this logging to help debug
            // console.log("isConfirmed status:", {
            //     hasPaymentAmount,
            //     hasChangeAmount,
            //     hasNonWaitingStatus,
            //     hasMetodeBayar,
            //     isConfirmed: hasPaymentAmount || hasNonWaitingStatus || (hasChangeAmount && hasMetodeBayar)
            // });
            
            setIsLoading(false);
        } catch (err) {
            setError('Gagal mengambil detail pembayaran');
            setIsLoading(false);
            console.error('Error fetching payment detail:', err);
        }
    };

    // Updated handleChange to properly handle number calculations
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData
        };
        
        if (name === 'jumlah_pembayaran') {
            // Convert to number explicitly and handle calculation
            const numValue = parseFloat(value) || 0;
            updatedFormData.jumlah_pembayaran = numValue;
            
            // Calculate change amount
            const kembalian = Math.max(0, numValue - grandTotal);
            updatedFormData.kembali = kembalian;
        } else {
            updatedFormData[name] = value;
        }
        
        setFormData(updatedFormData);
    };

    // Validate form before showing confirmation
    const handleSubmit = (e) => {
        e.preventDefault();

        if (parseFloat(formData.jumlah_pembayaran) < grandTotal) {
            setError('Jumlah pembayaran tidak boleh kurang dari total tagihan');
            return;
        }

        // Show confirmation before saving
        setShowConfirmation(true);
    };

    // Actual save function after confirmation - NOW SAVES PAYMENT DATA
    const handleConfirmSave = async () => {
        try {
            setIsLoading(true);
            
            // Get user data from localStorage
            let userId = null;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    userId = userData._id;
                } catch (e) {
                    console.error('Error parsing user data from localStorage:', e);
                }
            }
            
            // REVISED: Now saving payment data on "Simpan" button
            const dataToBeSent = {
                // Keep status as is, don't change status yet
                status_retribusi: formData.status_retribusi,
                metode_bayar: formData.metode_bayar,
                kembali: formData.kembali.toString(),
                jumlah_pembayaran: formData.jumlah_pembayaran.toString(),
            };
            
            // Log the data being sent for debugging
            // console.log('Sending payment data with data:', dataToBeSent);
            
            // Now actually send to the API
            await updateStatusPembayaran(pembayaranItem._id, dataToBeSent);
            
            // Mark as confirmed in the UI
            setIsConfirmed(true);
            setShowConfirmation(false);
            setIsLoading(false);
            
            // Clear any previous errors
            setError('');
            
        } catch (err) {
            setError('Gagal mengupdate pembayaran');
            setIsLoading(false);
            console.error('Error updating payment:', err);
        }
    };

    // Handle selesai button click
    const handleSelesaiClick = () => {
        setShowSelesaiConfirmation(true);
    };

    // Handle final confirmation for selesai - NOW ONLY UPDATES STATUS
    const handleConfirmSelesai = async () => {
        try {
            setIsLoading(true);
            
            // Get user data from localStorage correctly
            let userId = null;
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    userId = userData._id; // Extract the _id from the user object
                } catch (e) {
                    console.error('Error parsing user data from localStorage:', e);
                }
            }
            
            // Make sure we're sending both payment data and status updates
            const dataToBeSent = {
                status_retribusi: 'mengambil obat', // Change status to 'mengambil obat'
                // Include these fields to maintain consistency with previous data
                metode_bayar: formData.metode_bayar,
                kembali: formData.kembali.toString(),
                jumlah_pembayaran: formData.jumlah_pembayaran.toString(),
                
                // Add data to update booking status and ensure kunjungan data is complete
                update_booking: true,
                booking_data: {
                    status_booking: 'mengambil obat',
                },
                // Update kunjungan with status and user ID
                update_kunjungan: true,
                kunjungan_data: {
                    id_user: userId,
                    catatan: `Kembalian: ${formData.kembali}`,
                    status_kunjungan: 'mengambil obat'
                }
            };
            
            // Log the data being sent for debugging
            // console.log('Sending status update with data:', dataToBeSent);
            
            // Now actually send to the API
            await updateStatusPembayaran(pembayaranItem._id, dataToBeSent);
            
            setIsLoading(false);
            onUpdate(); // Refresh data in parent component
            onClose(); // Close the modal
        } catch (err) {
            setError('Gagal mengupdate pembayaran');
            setIsLoading(false);
            console.error('Error updating payment:', err);
        }
    };

    // Format currency (IDR)
    const formatCurrency = (amount) => {
        const value = parseFloat(amount);
        return isNaN(value) 
            ? 'Rp0' 
            : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(value);
    };
    

    // Modified handlePrintRetribusi function using Print-JS
    const handlePrintRetribusi = () => {
        // console.log('Print Retribusi for ID:', pembayaranItem._id);
        
        // Create HTML content for printing
        const printContent = `
            <div style="font-family: Arial, sans-serif; padding: 10px; width: 80mm; max-width: 80mm;">
                <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
                    <h1 style="font-size: 16px; font-weight: bold; margin: 0;">KLINIK HEWAN JOGJA</h1>
                    <p style="font-size: 14px; margin: 5px 0;">RETRIBUSI PEMBAYARAN</p>
                </div>
                
                <div style="margin-bottom: 10px; font-size: 12px;">
                    <div style="margin-bottom: 3px;"><strong>ID:</strong> ${pembayaranItem._id}</div>
                    <div style="margin-bottom: 3px;"><strong>Tanggal:</strong> ${currentDateTime}</div>
                    <div style="margin-bottom: 3px;"><strong>Nama Pemilik:</strong> ${pembayaranItem.nama_klien}</div>
                    <div style="margin-bottom: 3px;"><strong>Nama Pasien:</strong> ${pembayaranItem.nama_hewan}</div>
                    <div style="margin-bottom: 3px;"><strong>Nomor Antrian:</strong> ${detailData.id_kunjungan?.no_antri || '-'}</div>
                    <div style="margin-bottom: 3px;"><strong>Jenis Layanan:</strong> ${detailData.jenis_layanan || '-'}</div>
                    
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">PEMAKAIAN OBAT</div>
                    ${produks.length > 0 ? 
                        `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Nama Obat</th>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Jml</th>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${produks.map(produk => `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.nama}</td>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.jumlah}</td>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${formatCurrency(parseFloat(produk.subtotal_obat?.$numberDecimal || 0))}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div><strong>Total Obat:</strong> ${formatCurrency(totalObat)}</div>` : 
                        '<div>Tidak ada pemakaian obat</div>'}
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">JASA TINDAKAN</div>
                    ${pelayanans.length > 0 ? 
                        `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Tindakan</th>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Jml</th>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pelayanans.map(pelayanan => `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.nama}</td>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.jumlah}</td>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${formatCurrency(parseFloat(pelayanan.subtotal_pelayanan?.$numberDecimal || 0))}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div><strong>Total Tindakan:</strong> ${formatCurrency(totalPelayanan)}</div>` : 
                        '<div>Tidak ada jasa tindakan</div>'}
                </div>
                
                <div style="margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <div><strong>Grand Total:</strong></div>
                        <div>${formatCurrency(grandTotal)}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <div><strong>Jumlah Pembayaran:</strong></div>
                        <div>${formatCurrency(formData.jumlah_pembayaran)}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <div><strong>Kembalian:</strong></div>
                        <div>${formatCurrency(formData.kembali)}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <div><strong>Metode Pembayaran:</strong></div>
                        <div>${formData.metode_bayar.toUpperCase()}</div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; text-align: center; font-style: italic; font-size: 11px;">
                    <p>Terima kasih atas kunjungan Anda</p>
                    <p>Semoga hewan peliharaan Anda lekas sembuh</p>
                </div>
            </div>
        `;

        // Use Print-JS to print the HTML with custom configuration
        printJS({
            printable: printContent,
            type: 'raw-html',
            documentTitle: `Retribusi - ${pembayaranItem.nama_klien}`,
            targetStyles: ['*'],
            style: `
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 5mm;
                }
            `
        });
    };

    // Fix for handlePrintRekamMedis function in EditRetribusi.jsx
    // Fixed handlePrintRekamMedis function
    const handlePrintRekamMedis = () => {
        // console.log('Print Rekam Medis for ID:', pembayaranItem._id);
        
        // Format date function for the medical record
        const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };
        
        // Extract medical record data
        const rekamMedis = detailData.rekam_medis || {};

        // FIXED: Improved doctor name extraction
        // This extracts ALL doctors from the array, regardless of role
        const doctorNames = [];
        
        // Debug what we actually have in rekamMedis
        // console.log("Rekam Medis Data:", rekamMedis);
        
        if (rekamMedis && rekamMedis.dokters && Array.isArray(rekamMedis.dokters)) {
            // console.log("Dokters array:", rekamMedis.dokters);
            
            rekamMedis.dokters.forEach(dokter => {
                // Try to get doctor name from all possible locations
                let doctorName = null;
                
                // Check direct nama property first
                if (dokter.nama && dokter.nama !== '') {
                    doctorName = dokter.nama;
                    // console.log("Found name directly on dokter object:", doctorName);
                } 
                // Then check id_user.nama if available
                else if (dokter.id_user && dokter.id_user.nama && dokter.id_user.nama !== '') {
                    doctorName = dokter.id_user.nama;
                    // console.log("Found name in id_user object:", doctorName);
                }
                
                // Only add if we found a name and it's not already in the list
                if (doctorName && !doctorNames.includes(doctorName)) {
                    doctorNames.push(doctorName);
                }
            });
        } else {
            // console.log("No dokters array or it's not properly structured:", rekamMedis.dokters);
        }
        
        // Join doctor names with commas or show "Tidak ada dokter" if empty
        const doctorsText = doctorNames.length > 0 ? doctorNames.join(', ') : 'Tidak ada dokter';
        // console.log("Final doctor names to display:", doctorsText);
        
        // For main medical details, use the first doctor with data if available
        let mainDoctor = {};
        if (rekamMedis.dokters && Array.isArray(rekamMedis.dokters) && rekamMedis.dokters.length > 0) {
            // Find the first doctor with some medical data
            mainDoctor = rekamMedis.dokters.find(d => 
                d.hasil || d.diagnosa || d.berat_badan || d.suhu_badan
            ) || rekamMedis.dokters[0] || {};
        }
        
        // Format number values correctly to handle Decimal128 objects
        const formatDecimal128Value = (value) => {
            if (!value) return '-';
            
            // Handle Decimal128 objects
            if (value.$numberDecimal) {
                return value.$numberDecimal;
            }
            
            // Handle direct number values
            if (typeof value === 'number') {
                return value.toString();
            }
            
            // If it's already a string
            if (typeof value === 'string') {
                return value;
            }
            
            // Default fallback
            return '-';
        };
        
        // Create HTML content for the medical record
        const printContent = `
            <div style="font-family: Arial, sans-serif; padding: 10px; width: 80mm; max-width: 80mm;">
                <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px;">
                    <h1 style="font-size: 16px; font-weight: bold; margin: 0;">KLINIK HEWAN JOGJA</h1>
                    <p style="font-size: 14px; margin: 5px 0;">REKAM MEDIS</p>
                </div>
                
                <div style="margin-bottom: 10px; font-size: 12px;">
                    <div style="margin-bottom: 3px;"><strong>ID:</strong> ${rekamMedis._id || '-'}</div>
                    <div style="margin-bottom: 3px;"><strong>Tanggal:</strong> ${formatDate(rekamMedis.tanggal)}</div>
                    <div style="margin-bottom: 3px;"><strong>Nama Pemilik:</strong> ${pembayaranItem.nama_klien}</div>
                    <div style="margin-bottom: 3px;"><strong>Nama Pasien:</strong> ${pembayaranItem.nama_hewan}</div>
                    
                    <div style="margin-bottom: 3px;"><strong>Jenis Kelamin:</strong> ${detailData.id_kunjungan?.jenis_kelamin || '-'}</div>
                    <div style="margin-bottom: 3px;"><strong>Ras:</strong> ${detailData.id_kunjungan?.ras || '-'}</div>
                    <div style="margin-bottom: 3px;"><strong>Umur:</strong> ${detailData.id_kunjungan?.umur_hewan || '-'}</div>
                    <div style="margin-bottom: 3px;"><strong>Dokter:</strong> ${doctorsText}</div>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">HASIL PEMERIKSAAN</div>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 5px; margin-bottom: 10px; font-size: 11px;">
                        <div style="margin-bottom: 3px;"><strong>Keluhan:</strong> ${mainDoctor.hasil || rekamMedis.hasil || '-'}</div>
                        <div style="margin-bottom: 3px;"><strong>Diagnosa:</strong> ${mainDoctor.diagnosa || rekamMedis.diagnosa || '-'}</div>
                        <div style="margin-bottom: 3px;"><strong>Berat Badan:</strong> ${formatDecimal128Value(mainDoctor.berat_badan || rekamMedis.berat_badan)}</div>
                        <div style="margin-bottom: 3px;"><strong>Suhu Badan:</strong> ${formatDecimal128Value(mainDoctor.suhu_badan || rekamMedis.suhu_badan)}</div>
                        
                        <div style="margin-bottom: 3px;"><strong>Hasil:</strong> ${rekamMedis.hasil || '-'}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">PEMAKAIAN OBAT</div>
                    ${produks.length > 0 ? 
                        `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Nama Obat</th>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${produks.map(produk => `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.nama}</td>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${produk.jumlah}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>` : 
                        '<div>Tidak ada pemakaian obat</div>'}
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; font-size: 12px;">JASA TINDAKAN</div>
                    ${pelayanans.length > 0 ? 
                        `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Tindakan</th>
                                    <th style="border: 1px solid #ddd; padding: 4px; text-align: left; background-color: #f2f2f2;">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pelayanans.map(pelayanan => `
                                    <tr>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.nama}</td>
                                        <td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${pelayanan.jumlah}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>` : 
                        '<div>Tidak ada jasa tindakan</div>'}
                </div>
                
                <div style="margin-top: 15px; text-align: center; font-style: italic; font-size: 11px;">
                    <p>Dokumen ini adalah rekam medis resmi dari Klinik Hewan</p>
                </div>
            </div>
        `;

        // Use Print-JS to print the HTML with custom configuration
        printJS({
            printable: printContent,
            type: 'raw-html',
            documentTitle: `Rekam Medis - ${pembayaranItem.nama_hewan}`,
            targetStyles: ['*'],
            style: `
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 5mm;
                }
            `
        });
    };

    // Jika portal belum tersedia, jangan render apapun
    if (!portalElement) {
        return null;
    }


    // Konten modal yang akan di-render ke portal
    const modalContent = (
        <div className="editretribusi-popup-overlay2">
            <div className="edit-retribusi-popup">
                <div className="edit-header">
                    <h2>Pembayaran {pembayaranItem?.nama_klien || 'Pasien'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                
                <div className="edit-content">
                    {isLoading && <div className="loading-text">Memproses data...</div>}
                    
                    {error && <div className="error-message">{error}</div>}

                    {!isLoading && detailData && (
                        <div className="retribusi-container">
                            {/* Kolom Kiri - Data Retribusi */}
                            <div className="retribusi-section retribusi-left">
                                <div className="retribusi-section-title">RETRIBUSI PEMBAYARAN</div>
                                <div className="retribusi-data">
                                    <div><span className="label">ID:</span> {pembayaranItem._id}</div>
                                    <div><span className="label">Nama Pemilik:</span> {pembayaranItem.nama_klien}</div>
                                    <div><span className="label">Tanggal:</span> {currentDateTime}</div>
                                    <div><span className="label">Nama Pasien:</span> {pembayaranItem.nama_hewan}</div>
                                </div>

                                <div className="retribusi-section-title">PEMAKAIAN OBAT</div>
                                <div className="retribusi-data">
                                    {produks.length > 0 ? (
                                        produks.map((produk, idx) => (
                                            <div key={idx} className="produk-item">
                                                <div><span className="label">Nama Obat:</span> {produk.nama}</div>
                                                <div><span className="label">Jumlah:</span> {produk.jumlah}</div>
                                                <div><span className="label">Harga:</span> {formatCurrency(parseFloat(produk.harga?.$numberDecimal || 0))}</div>
                                                <div><span className="label">Subtotal:</span> {formatCurrency(parseFloat(produk.subtotal_obat?.$numberDecimal || 0))}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>Tidak ada pemakaian obat</div>
                                    )}
                                    {produks.length > 0 && (
                                        <div className="total-section">
                                            <span className="label">Total Obat:</span> {formatCurrency(totalObat)}
                                        </div>
                                    )}
                                </div>

                                <div className="retribusi-section-title">JASA TINDAKAN</div>
                                <div className="retribusi-data">
                                    {pelayanans.length > 0 ? (
                                        pelayanans.map((pelayanan, idx) => (
                                            <div key={idx} className="pelayanan-item">
                                                <div><span className="label">Tindakan:</span> {pelayanan.nama}</div>
                                                <div><span className="label">Jumlah:</span> {pelayanan.jumlah}</div>
                                                <div><span className="label">Harga:</span> {formatCurrency(parseFloat(pelayanan.harga?.$numberDecimal || 0))}</div>
                                                <div><span className="label">Subtotal:</span> {formatCurrency(parseFloat(pelayanan.subtotal_pelayanan?.$numberDecimal || 0))}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>Tidak ada jasa tindakan</div>
                                    )}
                                    {pelayanans.length > 0 && (
                                        <div className="total-section">
                                            <span className="label">Total Tindakan:</span> {formatCurrency(totalPelayanan)}
                                        </div>
                                    )}
                                </div>

                                <div className="retribusi-section-title">PEMBAYARAN</div>
                                <div className="retribusi-data">
                                    <div className="grand-total">
                                        <span className="label">Grand Total:</span> {formatCurrency(grandTotal)}
                                    </div>
                                </div>
                            </div>

                            {/* Kolom Kanan - Hasil Pembayaran dan Print */}
                            <div className="retribusi-section retribusi-right">
                                <div className="receipt-section">
                                    <div className="receipt-title">
                                        <h3>Pembayaran: {formatCurrency(formData.jumlah_pembayaran)}</h3>
                                        <h3>Kembali: {formatCurrency(formData.kembali)}</h3>
                                    </div>

                                    <div className="print-section">
                                        <div className="print-title">Print Retribusi Pembayaran:</div>
                                        <button 
                                            className="print-button" 
                                            onClick={handlePrintRetribusi}
                                            disabled={!isConfirmed}
                                        >
                                            <img src={retribusiImg} alt="Print Retribusi" />
                                        </button>
                                    </div>

                                    <div className="print-section">
                                        <div className="print-title">Print Rekam Medis:</div>
                                        <button 
                                            className="print-button2" 
                                            onClick={handlePrintRekamMedis}
                                            disabled={!isConfirmed}
                                        >
                                            <img src={rekamMedisImg} alt="Print Rekam Medis" />
                                        </button>
                                    </div>

                                    <div className="action-buttons">
                                        <button 
                                            className="selesai-button"
                                            onClick={handleSelesaiClick}
                                            disabled={isLoading || (!isConfirmed && 
                                                (parseFloat(formData.jumlah_pembayaran) < grandTotal || formData.kembali <= 0))}
                                        >
                                            Selesai
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog for Save */}
            {showConfirmation && (
                <Popup2
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    title="Konfirmasi Pembayaran"
                    description={`Apakah data pembayaran sudah benar? Total tagihan: ${formatCurrency(grandTotal)}, Jumlah pembayaran: ${formatCurrency(formData.jumlah_pembayaran)}, Kembali: ${formatCurrency(formData.kembali)}`}
                    onConfirm={handleConfirmSave}
                />
            )}

            {/* Confirmation Dialog for Selesai */}
            {showSelesaiConfirmation && (
                <Popup2
                    isOpen={showSelesaiConfirmation}
                    onClose={() => setShowSelesaiConfirmation(false)}
                    title="Konfirmasi Selesai"
                    description="Apakah anda yakin ingin menyelesaikan pembayaran dan memberikan status mengambil obat dan akan menghilangkan data ini dari kasir?"
                    onConfirm={handleConfirmSelesai}
                />
            )}
        </div>
    );

    // Gunakan ReactDOM.createPortal untuk me-render modal ke elemen portal
    return ReactDOM.createPortal(modalContent, portalElement);

// Gunakan ReactDOM.createPortal untuk me-render modal ke elemen portal
return ReactDOM.createPortal(modalContent, portalElement);
};

export default EditRetribusi;