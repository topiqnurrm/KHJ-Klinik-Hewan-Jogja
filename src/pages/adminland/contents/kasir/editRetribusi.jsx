import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './EditRetribusi.css';
import { updateStatusPembayaran, getPembayaranDetail } from '../../../../api/api-aktivitas-kasir';
import Popup2 from '../../admin_nav/popup_nav/popup2';

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

    // Fetch payment details
    const fetchPembayaranDetail = async () => {
        try {
            setIsLoading(true);
            const data = await getPembayaranDetail(pembayaranItem._id);
            setDetailData(data);
            
            // Cek dan set data rekam medis
            if (data.rekam_medis) {
                if (data.rekam_medis.dokters) {
                    setDokters(data.rekam_medis.dokters);
                }
                
                if (data.rekam_medis.produks) {
                    setProduks(data.rekam_medis.produks);
                    // Hitung total obat
                    const totalHargaObat = data.rekam_medis.produks.reduce(
                        (sum, produk) => sum + parseFloat(produk.subtotal_obat.$numberDecimal || 0), 
                        0
                    );
                    setTotalObat(totalHargaObat);
                }
                
                if (data.rekam_medis.pelayanans2) {
                    setPelayanans(data.rekam_medis.pelayanans2);
                    // Hitung total pelayanan
                    const totalHargaPelayanan = data.rekam_medis.pelayanans2.reduce(
                        (sum, pelayanan) => sum + parseFloat(pelayanan.subtotal_pelayanan.$numberDecimal || 0), 
                        0
                    );
                    setTotalPelayanan(totalHargaPelayanan);
                }
            }
            
            // Set grand total dari data retribusi
            const total = parseFloat(data.grand_total.$numberDecimal || 0);
            setGrandTotal(total);
            
            // Set form data - initialize jumlah_pembayaran to 0 instead of total
            setFormData({
                status_retribusi: data.status_retribusi || 'menunggu pembayaran',
                metode_bayar: data.metode_bayar || 'cash',
                jumlah_pembayaran: 0, // Initialize to 0 as per requirement
                kembali: 0
            });
            
            setIsLoading(false);
        } catch (err) {
            setError('Gagal mengambil detail pembayaran');
            setIsLoading(false);
            console.error('Error fetching payment detail:', err);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        
        // Kalkulasi kembalian jika input jumlah pembayaran berubah
        if (name === 'jumlah_pembayaran') {
            const jumlahPembayaran = parseFloat(value) || 0;
            const kembalian = Math.max(0, jumlahPembayaran - grandTotal);
            updatedFormData.kembali = kembalian;
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

    // Actual save function after confirmation
    const handleConfirmSave = async () => {
        try {
            setIsLoading(true);
            
            // Note: We're just marking as confirmed in the UI, but not sending to the API yet
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

    // Handle final confirmation for selesai
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
            
            // Prepare data for API
            const dataToBeSent = {
                status_retribusi: 'mengambil obat', // Change status to 'mengambil obat'
                metode_bayar: formData.metode_bayar,
                kembali: formData.kembali.toString(),
                jumlah_pembayaran: formData.jumlah_pembayaran.toString(),
                // Add data to update booking status and ensure kunjungan data is complete
                update_booking: true,
                booking_data: {
                    status_booking: 'mengambil obat',
                },
                // Fixed section to update administrasis2 in Kunjungan with correct user ID
                update_kunjungan: true,
                kunjungan_data: {
                    id_user: userId, // Now using the properly extracted user ID
                    catatan: `Kembalian: ${formData.kembali}`,
                    status_kunjungan: 'mengambil obat'
                }
            };
            
            // Log the data being sent for debugging
            console.log('Sending payment update with data:', dataToBeSent);
            
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
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Handle print actions
    const handlePrintRetribusi = () => {
        console.log('Print Retribusi');
        // Implement print functionality
    };

    const handlePrintRekamMedis = () => {
        console.log('Print Rekam Medis');
        // Implement print functionality
    };

    // Jika portal belum tersedia, jangan render apapun
    if (!portalElement) {
        return null;
    }

    // Konten modal yang akan di-render ke portal
    const modalContent = (
        <div className="editretribusi-popup-overlay">
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
                                    
                                    {dokters.length > 0 && (
                                        <div className="dokter-section">
                                            <span className="label">Dokter:</span>
                                            {dokters.map((dokter, idx) => (
                                                <div key={idx} className="dokter-item">
                                                    {dokter.id_user?.nama || 'Dokter'}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

                            {/* Kolom Tengah - Form Input */}
                            <div className="retribusi-section retribusi-center">
                                <form onSubmit={handleSubmit}>
                                    <div className="input-section">
                                        <label>Total Tagihan:</label>
                                        <input 
                                            type="text" 
                                            value={formatCurrency(grandTotal)}
                                            readOnly
                                            className="currency-input disabled"
                                        />
                                    </div>

                                    <div className="input-section">
                                        <label>Jumlah Pembayaran Klien:</label>
                                        <input 
                                            type="number" 
                                            name="jumlah_pembayaran"
                                            value={formData.jumlah_pembayaran}
                                            onChange={handleChange}
                                            min={grandTotal}
                                            className="currency-input"
                                            required
                                            disabled={isConfirmed}
                                        />
                                    </div>

                                    <div className="input-section">
                                        <label>Kembalian:</label>
                                        <input 
                                            type="text" 
                                            value={formatCurrency(formData.kembali)}
                                            readOnly
                                            className="currency-input disabled"
                                        />
                                    </div>

                                    <div className="input-section">
                                        <label>Metode Pembayaran:</label>
                                        <select 
                                            name="metode_bayar" 
                                            value={formData.metode_bayar}
                                            onChange={handleChange}
                                            required
                                            disabled={isConfirmed}
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="debit">Debit</option>
                                            <option value="kredit">Kredit</option>
                                            <option value="transfer">Transfer</option>
                                            <option value="qris">QRIS</option>
                                            <option value="ovo">OVO</option>
                                            <option value="gopay">GoPay</option>
                                            <option value="dana">DANA</option>
                                            <option value="linkaja">LinkAja</option>
                                        </select>
                                    </div>

                                    <div className="action-buttons">
                                        <button 
                                            type="submit" 
                                            className="simpan-button"
                                            disabled={isLoading || isConfirmed || parseFloat(formData.jumlah_pembayaran) < grandTotal}
                                        >
                                            {isLoading ? 'Memproses...' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
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
                                            <img src="/images/retribusi.png" alt="Print Retribusi" />
                                        </button>
                                    </div>

                                    <div className="print-section">
                                        <div className="print-title">Print Rekam Medis:</div>
                                        <button 
                                            className="print-button" 
                                            onClick={handlePrintRekamMedis}
                                            disabled={!isConfirmed}
                                        >
                                            <img src="/images/rekammedis.png" alt="Print Rekam Medis" />
                                        </button>
                                    </div>

                                    <div className="action-buttons">
                                        <button 
                                            className="selesai-button"
                                            onClick={handleSelesaiClick}
                                            disabled={!isConfirmed}
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
};

export default EditRetribusi;