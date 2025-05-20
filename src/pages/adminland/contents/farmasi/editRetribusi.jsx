import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './EditRetribusi.css';
import { updateStatusPembayaran } from '../../../../api/api-aktivitas-farmasi';
import Popup2 from '../../admin_nav/popup_nav/popup2';

// Import PrintServices functionality
import {
    usePaymentDetail,
    formatCurrency,
    formatDate,
    printRetribusi,
    printRekamMedis
} from '../../../../components/print_historis/PrintServices'; // Adjust the path as needed

import retribusiImg from './images/retribusi.png';
import rekamMedisImg from './images/rekammedis.png';

const EditRetribusi = ({ pembayaranItem, onClose, onUpdate }) => {
    // Use the custom hook from PrintServices to fetch and manage payment details
    const {
        detailData,
        isLoading: isDataLoading,
        error: fetchError,
        handlePrintRetribusi,
        handlePrintRekamMedis
    } = usePaymentDetail(pembayaranItem._id);
    
    // Add local loading state for operations within this component
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        status_retribusi: 'menunggu pembayaran',
        metode_bayar: 'cash',
        jumlah_pembayaran: 0,
        kembali: 0
    });
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSelesaiConfirmation, setShowSelesaiConfirmation] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [portalElement, setPortalElement] = useState(null);

    // Combined loading state for UI
    const isLoading = isDataLoading || isProcessing;

    // Set up portal element for modal
    useEffect(() => {
        let element = document.getElementById('portal-root');
        
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
        
        // Cleanup
        return () => {
            if (element && element.parentNode && !element.hasChildNodes()) {
                element.parentNode.removeChild(element);
            }
        };
    }, []);

    // Update form data when detailData changes
    useEffect(() => {
        if (detailData) {
            // Extract payment and change values
            const { grandTotal, jumlahPembayaran, kembali } = detailData;
            
            setFormData({
                status_retribusi: detailData.status_retribusi || 'menunggu pembayaran',
                metode_bayar: detailData.metode_bayar || 'cash',
                jumlah_pembayaran: jumlahPembayaran,
                kembali: kembali
            });
            
            // Determine if payment is already confirmed
            const hasPaymentAmount = jumlahPembayaran > 0;
            const hasChangeAmount = kembali >= 0;
            const hasNonWaitingStatus = detailData.status_retribusi && 
                detailData.status_retribusi !== 'menunggu pembayaran';
            const hasMetodeBayar = detailData.metode_bayar && detailData.metode_bayar !== '';

            // More lenient condition - any sign of payment processing should enable confirmation
            setIsConfirmed(hasPaymentAmount || hasNonWaitingStatus || (hasChangeAmount && hasMetodeBayar));
        }
    }, [detailData]);

    // Update error message if fetch error occurs
    useEffect(() => {
        if (fetchError) {
            setError(fetchError);
        }
    }, [fetchError]);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData };
        
        if (name === 'jumlah_pembayaran') {
            // Convert to number explicitly and handle calculation
            const numValue = parseFloat(value) || 0;
            updatedFormData.jumlah_pembayaran = numValue;
            
            // Calculate change amount
            const kembalian = Math.max(0, numValue - (detailData?.grandTotal || 0));
            updatedFormData.kembali = kembalian;
        } else {
            updatedFormData[name] = value;
        }
        
        setFormData(updatedFormData);
    };

    // Validate form before showing confirmation
    const handleSubmit = (e) => {
        e.preventDefault();

        if (parseFloat(formData.jumlah_pembayaran) < (detailData?.grandTotal || 0)) {
            setError('Jumlah pembayaran tidak boleh kurang dari total tagihan');
            return;
        }

        // Show confirmation before saving
        setShowConfirmation(true);
    };

    // Save payment details after confirmation
    const handleConfirmSave = async () => {
        try {
            setIsProcessing(true);
            
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
            
            // Data to be sent to API
            const dataToBeSent = {
                status_retribusi: formData.status_retribusi,
                metode_bayar: formData.metode_bayar,
                kembali: formData.kembali.toString(),
                jumlah_pembayaran: formData.jumlah_pembayaran.toString(),
            };
            
            // Send to API
            await updateStatusPembayaran(pembayaranItem._id, dataToBeSent);
            
            // Mark as confirmed in the UI
            setIsConfirmed(true);
            setShowConfirmation(false);
            setError('');
            
        } catch (err) {
            setError('Gagal mengupdate pembayaran');
            console.error('Error updating payment:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelesaiClick = () => {
        // Show confirmation dialog
        setShowSelesaiConfirmation(true);
    };

    // Handle final confirmation for selesai - Only updates status
    const handleConfirmSelesai = async () => {
        try {
            setIsProcessing(true);
            
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
            
            // Data to be sent to API
            const dataToBeSent = {
                status_retribusi: 'selesai',
                metode_bayar: formData.metode_bayar,
                kembali: formData.kembali.toString(),
                jumlah_pembayaran: formData.jumlah_pembayaran.toString(),
                
                // Add data to update booking status and ensure kunjungan data is complete
                update_booking: true,
                booking_data: {
                    status_booking: 'selesai',
                },
                // Update kunjungan with status and user ID
                update_kunjungan: true,
                kunjungan_data: {
                    id_user: userId,
                    catatan: `Kembalian: ${formData.kembali}`,
                    status_kunjungan: 'selesai'
                }
            };
            
            // Send to API
            await updateStatusPembayaran(pembayaranItem._id, dataToBeSent);
            
            setShowSelesaiConfirmation(false);
            onUpdate(); // Refresh data in parent component
            onClose(); // Close the modal
        } catch (err) {
            setError('Gagal mengupdate pembayaran');
            console.error('Error updating payment:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Wrapper functions for printing that use the PrintServices functions
    const onPrintRetribusi = () => {
        if (!detailData || !pembayaranItem) {
            setError('Tidak dapat mencetak retribusi: Data tidak lengkap');
            return;
        }
        
        const paymentData = {
            jumlahPembayaran: formData.jumlah_pembayaran,
            kembali: formData.kembali,
            metodeBayar: formData.metode_bayar || 'cash'
        };
        
        printRetribusi(pembayaranItem, detailData, paymentData);
    };
    
    const onPrintRekamMedis = () => {
        if (!detailData || !pembayaranItem) {
            setError('Tidak dapat mencetak rekam medis: Data tidak lengkap');
            return;
        }
        
        printRekamMedis(pembayaranItem, detailData);
    };

    // Return early if portal not available
    if (!portalElement) {
        return null;
    }

    // Modal content
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
                            {/* Left Column - Data Retribusi */}
                            <div className="retribusi-section retribusi-left">
                                <div className="retribusi-section-title">FARMASI</div>
                                <div className="retribusi-data">
                                    <div><span className="label">ID:</span> {pembayaranItem._id}</div>
                                    <div><span className="label">Nama Pemilik:</span> {pembayaranItem.nama_klien}</div>
                                    <div><span className="label">Tanggal:</span> {currentDateTime}</div>
                                    <div><span className="label">Nama Pasien:</span> {pembayaranItem.nama_hewan}</div>
                                    
                                    {/* Pemeriksaan data from rekam_medis */}
                                    {detailData?.rekam_medis?.pemeriksaan && (
                                        <div className="pemeriksaan-section">
                                            <div className="label-section">No Obat yang Ditebus:</div>
                                            <div className="pemeriksaan-text">{detailData.rekam_medis.pemeriksaan}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="retribusi-section-title">PEMAKAIAN OBAT</div>
                                <div className="retribusi-data">
                                    {detailData.produks && detailData.produks.length > 0 ? (
                                        [...detailData.produks].reverse().map((produk, idx) => (
                                            <div key={idx} className="produk-item">
                                                <div className="label"><span>No:</span> {idx + 1}</div>
                                                <div><span className="label">Nama Obat:</span> {produk.nama}</div>
                                                <div><span className="label">Kategori:</span> {produk.kategori || '-'}</div>
                                                <div><span className="label">Jenis:</span> {produk.jenis || '-'}</div>
                                                <div><span className="label">Jumlah:</span> {produk.jumlah}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>Tidak ada pemakaian obat</div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Payment Receipt and Print */}
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
                                            onClick={onPrintRetribusi}
                                            disabled={!isConfirmed}
                                        >
                                            <img src={retribusiImg} alt="Print Retribusi" />
                                        </button>
                                    </div>

                                    <div className="print-section">
                                        <div className="print-title">Print Rekam Medis:</div>
                                        <button 
                                            className="print-button2" 
                                            onClick={onPrintRekamMedis}
                                            disabled={!isConfirmed}
                                        >
                                            <img src={rekamMedisImg} alt="Print Rekam Medis" />
                                        </button>
                                    </div>

                                    <div className="action-buttons">
                                        <button 
                                            className="selesai-button"
                                            onClick={handleSelesaiClick}
                                            disabled={isLoading || !isConfirmed || formData.status_retribusi !== 'mengambil obat'}
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
                    description={`Apakah data pembayaran sudah benar? Total tagihan: ${formatCurrency(detailData?.grandTotal || 0)}, Jumlah pembayaran: ${formatCurrency(formData.jumlah_pembayaran)}, Kembali: ${formatCurrency(formData.kembali)}`}
                    onConfirm={handleConfirmSave}
                />
            )}

            {/* Confirmation Dialog for Selesai */}
            {showSelesaiConfirmation && (
                <Popup2
                    isOpen={showSelesaiConfirmation}
                    onClose={() => setShowSelesaiConfirmation(false)}
                    title="Konfirmasi Selesai"
                    description="Apakah anda yakin ingin menyelesaikan pembayaran dan memberikan status selesai serta akan menghilangkan data ini dari kasir?"
                    onConfirm={handleConfirmSelesai}
                />
            )}
        </div>
    );

    // Use ReactDOM.createPortal to render the modal
    return ReactDOM.createPortal(modalContent, portalElement);
};

export default EditRetribusi;