import React, { useState } from 'react';
import './laporan.css'; // Import CSS custom

const Laporan = () => {
    // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // State untuk tanggal awal dan akhir
    const [tanggalAwal, setTanggalAwal] = useState(getTodayDate());
    const [tanggalAkhir, setTanggalAkhir] = useState(getTodayDate());
    const [loading, setLoading] = useState(false);
    const [laporanData, setLaporanData] = useState(null);

    // Fungsi untuk format tanggal Indonesia
    const formatTanggalIndonesia = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return date.toLocaleDateString('id-ID', options);
    };

    // Fungsi untuk format angka dengan titik sebagai pemisah ribuan
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    // Fungsi untuk handle perubahan tanggal awal
    const handleTanggalAwalChange = (newTanggalAwal) => {
        setTanggalAwal(newTanggalAwal);
        
        // Jika tanggal awal lebih besar dari tanggal akhir, update tanggal akhir
        if (newTanggalAwal > tanggalAkhir) {
            setTanggalAkhir(newTanggalAwal);
        }
    };

    // Fungsi untuk handle perubahan tanggal akhir
    const handleTanggalAkhirChange = (newTanggalAkhir) => {
        // Hanya update jika tanggal akhir tidak lebih kecil dari tanggal awal
        if (newTanggalAkhir >= tanggalAwal) {
            setTanggalAkhir(newTanggalAkhir);
        } else {
            alert('Tanggal akhir tidak boleh lebih awal dari tanggal awal!');
        }
    };

    // Fungsi untuk mengambil data laporan dari API
    const getLaporanKunjungan = async (tanggalAwal, tanggalAkhir) => {
        try {
            const url = new URL('http://localhost:5000/api/laporan/kunjungan');
            url.searchParams.append('tanggal_awal', tanggalAwal);
            url.searchParams.append('tanggal_akhir', tanggalAkhir);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Gagal mengambil laporan kunjungan:', error);
            throw error;
        }
    };

    // Fungsi untuk generate HTML laporan - BAGIAN YANG DIPERBAIKI
    const generateLaporanHTML = (data) => {
        const periode = tanggalAwal === tanggalAkhir 
            ? formatTanggalIndonesia(tanggalAwal)
            : `${formatTanggalIndonesia(tanggalAwal)} - ${formatTanggalIndonesia(tanggalAkhir)}`;

        return `
            <div class="print-content">
                <div class="header">
                    <h1>Laporan Kunjungan KHJ (Klinik Hewan Jogja)</h1>
                    <h2>Periode: ${periode}</h2>
                    
                    <!-- Summary Cards -->
                    <div class="summary-cards">
                        <div class="summary-card">
                            <div class="summary-title">Total Pasien</div>
                            <div class="summary-value">${data.rekap_pasien?.length || 0}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-title">Total Obat</div>
                            <div class="summary-value">${data.rekap_obat?.length || 0} Item</div>
                            <div class="summary-subtitle">Rp ${formatRupiah(data.total_obat || 0)}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-title">Total Pelayanan</div>
                            <div class="summary-value">${data.rekap_pelayanan?.length || 0} Item</div>
                            <div class="summary-subtitle">Rp ${formatRupiah(data.total_pelayanan || 0)}</div>
                        </div>
                    </div>
                </div>

                <!-- Rekap Pasien -->
                <div class="section">
                    <h3>Rekap Pasien</h3>
                    <table class="report-table pasien-table">
                        <thead>
                            <tr>
                                <th style="width: 30px;">No</th>
                                <th style="width: 80px;">Tanggal Mulai</th>
                                <th style="width: 80px;">Tanggal Selesai</th>
                                <th style="width: 100px;">Nama</th>
                                <th style="width: 150px;">Dokter</th>
                                <th style="width: 200px;">Diagnosa</th>
                                <th style="width: 100px;">Pemilik</th>
                                <th style="width: 60px;">No Antri</th>
                                <th style="width: 80px;">Kategori</th>
                                <th style="width: 100px;">Jenis Layanan</th>
                                <th style="width: 80px;">Biaya</th>
                                <th style="width: 70px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.rekap_pasien?.map((pasien, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${new Date(pasien.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                                    <td>${new Date(pasien.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                    <td>${pasien.nama || '-'}</td>
                                    <td class="wrap-cell">${pasien.dokter || '-'}</td>
                                    <td class="wrap-cell">${pasien.diagnosa || '-'}</td>
                                    <td>${pasien.pemilik || '-'}</td>
                                    <td>${pasien.no_antri || '-'}</td>
                                    <td>${pasien.kategori || '-'}</td>
                                    <td class="wrap-cell">${pasien.jenis_layanan || '-'}</td>
                                    <td>Rp ${formatRupiah(pasien.biaya || 0)}</td>
                                    <td>${pasien.status || '-'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="12">Tidak ada data</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Rekap Obat -->
                <div class="section">
                    <h3>Rekap Obat</h3>
                    <table class="report-table obat-table">
                        <thead>
                            <tr>
                                <th style="width: 30px;">No</th>
                                <th style="width: 80px;">Tanggal</th>
                                <th style="width: 100px;">Pasien</th>
                                <th style="width: 100px;">Klien</th>
                                <th style="width: 150px;">Obat</th>
                                <th style="width: 80px;">Jenis</th>
                                <th style="width: 80px;">Kategori</th>
                                <th style="width: 80px;">Harga</th>
                                <th style="width: 40px;">Qty</th>
                                <th style="width: 80px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.rekap_obat?.map((obat, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${new Date(obat.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td>${obat.pasien || '-'}</td>
                                    <td>${obat.klien || '-'}</td>
                                    <td class="wrap-cell">${obat.obat || '-'}</td>
                                    <td>${obat.jenis || '-'}</td>
                                    <td>${obat.kategori || '-'}</td>
                                    <td>Rp ${formatRupiah(obat.harga || 0)}</td>
                                    <td>${obat.qty || 0}</td>
                                    <td>Rp ${formatRupiah(obat.total || 0)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="10">Tidak ada data</td></tr>'}
                            <tr class="total-row">
                                <td colspan="9"><strong>Total Obat</strong></td>
                                <td><strong>Rp ${formatRupiah(data.total_obat || 0)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Rekap Pelayanan -->
                <div class="section">
                    <h3>Rekap Pelayanan / Jasa</h3>
                    <table class="report-table pelayanan-table">
                        <thead>
                            <tr>
                                <th style="width: 30px;">No</th>
                                <th style="width: 80px;">Tanggal</th>
                                <th style="width: 100px;">Pasien</th>
                                <th style="width: 100px;">Klien</th>
                                <th style="width: 150px;">Pelayanan</th>
                                <th style="width: 80px;">Kategori</th>
                                <th style="width: 80px;">Harga</th>
                                <th style="width: 40px;">Qty</th>
                                <th style="width: 80px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.rekap_pelayanan?.map((pelayanan, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${new Date(pelayanan.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td>${pelayanan.pasien || '-'}</td>
                                    <td>${pelayanan.klien || '-'}</td>
                                    <td class="wrap-cell">${pelayanan.pelayanan || '-'}</td>
                                    <td>${pelayanan.kategori || '-'}</td>
                                    <td>Rp ${formatRupiah(pelayanan.harga || 0)}</td>
                                    <td>${pelayanan.qty || 0}</td>
                                    <td>Rp ${formatRupiah(pelayanan.total || 0)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="9">Tidak ada data</td></tr>'}
                            <tr class="total-row">
                                <td colspan="8"><strong>Total Pelayanan</strong></td>
                                <td><strong>Rp ${formatRupiah(data.total_pelayanan || 0)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total-pendapatan">
                    <h3>Total Pendapatan: Rp ${formatRupiah(data.total_pendapatan || 0)}</h3>
                </div>
            </div>

            <style>
                @media print {
                    body { 
                        margin: 0; 
                        font-size: 12px; 
                    }
                    .no-print { 
                        display: none !important; 
                    }
                    .print-content { 
                        width: 100%; 
                    }
                    
                    /* Hapus page breaks yang tidak perlu */
                    .section {
                        page-break-inside: auto; /* Ubah dari avoid ke auto */
                        break-inside: auto;
                    }
                    
                    /* Hanya cegah page break di tengah tabel */
                    .report-table {
                        page-break-inside: auto;
                    }
                    
                    .report-table thead {
                        display: table-header-group; /* Pastikan header tabel muncul di setiap halaman */
                    }
                    
                    .report-table tbody {
                        page-break-inside: auto;
                    }
                    
                    .report-table tr {
                        page-break-inside: avoid; /* Cegah baris tabel terpotong */
                        break-inside: avoid;
                    }
                    
                    /* Cegah orphan/widow lines */
                    h1, h2, h3 {
                        page-break-after: avoid;
                        break-after: avoid;
                        orphans: 3;
                        widows: 3;
                    }
                }
                
                .print-content {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #000;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px; /* Kurangi margin */
                    border-bottom: 2px solid #000;
                    padding-bottom: 15px; /* Kurangi padding */
                }
                
                .header h1 {
                    font-size: 18px;
                    margin: 0 0 8px 0; /* Kurangi margin */
                    font-weight: bold;
                }
                
                .header h2 {
                    font-size: 14px;
                    margin: 0 0 15px 0;
                    font-weight: normal;
                }
                
                /* Summary Cards Styles */
                .summary-cards {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                
                .summary-card {
                    background-color: #f8f9fa;
                    border: 1px solid #000;
                    border-radius: 8px;
                    padding: 12px 16px;
                    min-width: 140px;
                    text-align: center;
                }
                
                .summary-title {
                    font-size: 11px;
                    color: #000;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                
                .summary-value {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 2px;
                }
                
                .summary-subtitle {
                    font-size: 9px;
                    color:rgb(55, 190, 64);
                    font-weight: 500;
                }
                
                .section {
                    margin-bottom: 20px; /* Kurangi margin dari 30px ke 20px */
                }
                
                .section h3 {
                    font-size: 14px;
                    margin: 0 0 10px 0; /* Kurangi margin */
                    font-weight: bold;
                    background-color: #f0f0f0;
                    padding: 6px 8px; /* Kurangi padding */
                    border: 1px solid #000;
                }
                
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 8px; /* Kurangi margin */
                    table-layout: auto; /* UBAH dari fixed ke auto agar kolom menyesuaikan isi */
                }
                
                .report-table th, 
                .report-table td {
                    border: 1px solid #000;
                    padding: 2px 3px; /* Kurangi padding vertikal dari 4px ke 2px */
                    text-align: left;
                    vertical-align: top !important; /* Paksa semua cell ke atas */
                    font-size: 10px;
                    line-height: 1.1 !important; /* Kurangi line height */
                }
                
                /* Styling khusus untuk cell yang perlu wrap text */
                .report-table .wrap-cell {
                    vertical-align: top !important;
                    padding-top: 2px !important; /* Padding top minimal */
                    padding-bottom: 2px !important;
                    line-height: 1.1 !important; /* Line height untuk readability */
                    white-space: normal; /* Izinkan text wrapping */
                    word-wrap: break-word;
                    word-break: break-word;
                }
                
                .report-table th {
                    background-color: #e0e0e0;
                    font-weight: bold;
                    text-align: center;
                    vertical-align: middle; /* Header tetap center */
                    white-space: nowrap; /* Header tidak wrap */
                }
                
                /* Alignment khusus untuk kolom tertentu */
                .report-table td:first-child {
                    text-align: center;
                    white-space: nowrap;
                }
                
                /* Tanggal columns - center alignment, no wrap */
                .pasien-table td:nth-child(2),
                .pasien-table td:nth-child(3),
                .obat-table td:nth-child(2),
                .pelayanan-table td:nth-child(2) {
                    text-align: center;
                    white-space: nowrap;
                }
                
                /* No Antri - center alignment */
                .pasien-table td:nth-child(8) {
                    text-align: center;
                    white-space: nowrap;
                }
                
                /* Qty columns - center alignment */
                .obat-table td:nth-child(9),
                .pelayanan-table td:nth-child(8) {
                    text-align: center;
                    white-space: nowrap;
                }
                
                /* Currency columns - right alignment */
                .pasien-table td:nth-child(11),
                .obat-table td:nth-child(8),
                .obat-table td:nth-child(10),
                .pelayanan-table td:nth-child(7),
                .pelayanan-table td:nth-child(9) {
                    text-align: right;
                    white-space: nowrap;
                }
                
                .total-row {
                    font-weight: bold;
                    background-color: #f9f9f9;
                }
                
                .total-pendapatan {
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 20px; /* Kurangi margin */
                    padding: 15px; /* Kurangi padding */
                    border: 2px solid #000;
                    background-color: #f0f0f0;
                }
                
                .total-pendapatan h3 {
                    margin: 0;
                }
            </style>
        `;
    };

    // Fungsi untuk handle cetak dengan Print.js
    const handleCetak = async () => {
        // Validasi tambahan sebelum cetak
        if (tanggalAwal > tanggalAkhir) {
            alert('Tanggal awal tidak boleh lebih besar dari tanggal akhir!');
            return;
        }

        setLoading(true);

        try {
            // Ambil data dari API
            const data = await getLaporanKunjungan(tanggalAwal, tanggalAkhir);
            setLaporanData(data); // Simpan data untuk summary cards
            
            // Generate HTML untuk print
            const printHTML = generateLaporanHTML(data);
            
            // Create temporary div
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = printHTML;
            document.body.appendChild(tempDiv);
            
            // Use Print.js if available, otherwise fallback to window.print
            if (window.printJS) {
                window.printJS({
                    printable: tempDiv,
                    type: 'html',
                    documentTitle: 'Laporan Kunjungan KHJ (Klinik Hewan Jogja)',
                    css: `
                        @media print {
                            body { 
                                margin: 0; 
                                font-size: 12px; 
                            }
                            .no-print { 
                                display: none !important; 
                            }
                            
                            /* Hapus page breaks yang tidak perlu */
                            .section {
                                page-break-inside: auto;
                                break-inside: auto;
                            }
                            
                            /* Hanya cegah page break di tengah tabel */
                            .report-table {
                                page-break-inside: auto;
                                table-layout: auto;
                            }
                            
                            .report-table thead {
                                display: table-header-group;
                            }
                            
                            .report-table tbody {
                                page-break-inside: auto;
                            }
                            
                            .report-table tr {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                            
                            /* Cegah orphan/widow lines */
                            h1, h2, h3 {
                                page-break-after: avoid;
                                break-after: avoid;
                                orphans: 3;
                                widows: 3;
                            }
                        }
                        
                        .print-content {
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                            line-height: 1.4;
                            color: #000;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            border-bottom: 2px solid #000;
                            padding-bottom: 15px;
                        }
                        
                        .header h1 {
                            font-size: 18px;
                            margin: 0 0 8px 0;
                            font-weight: bold;
                        }
                        
                        .header h2 {
                            font-size: 14px;
                            margin: 0 0 15px 0;
                            font-weight: normal;
                        }
                        
                        /* Summary Cards Styles */
                        .summary-cards {
                            display: flex;
                            justify-content: center;
                            gap: 20px;
                            margin-top: 15px;
                            flex-wrap: wrap;
                        }
                        
                        .summary-card {
                            background-color: #f8f9fa;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 12px 16px;
                            min-width: 140px;
                            text-align: center;
                        }
                        
                        .summary-title {
                            font-size: 11px;
                            color: #666;
                            margin-bottom: 5px;
                            font-weight: 500;
                        }
                        
                        .summary-value {
                            font-size: 16px;
                            font-weight: bold;
                            color: #2c3e50;
                            margin-bottom: 2px;
                        }
                        
                        .summary-subtitle {
                            font-size: 9px;
                            color: #e74c3c;
                            font-weight: 500;
                        }
                        
                        .section {
                            margin-bottom: 20px;
                        }
                        
                        .section h3 {
                            font-size: 14px;
                            margin: 0 0 10px 0;
                            font-weight: bold;
                            background-color: #f0f0f0;
                            padding: 6px 8px;
                            border: 1px solid #000;
                        }
                        
                        .report-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 8px;
                            table-layout: auto;
                        }
                        
                        .report-table th, 
                        .report-table td {
                            border: 1px solid #000;
                            padding: 2px 3px;
                            text-align: left;
                            vertical-align: top !important;
                            font-size: 10px;
                            line-height: 1.1 !important;
                        }
                        
                        /* Styling khusus untuk cell yang perlu wrap text */
                        .report-table .wrap-cell {
                            vertical-align: top !important;
                            padding-top: 2px !important;
                            padding-bottom: 2px !important;
                            line-height: 1.1 !important;
                            white-space: normal;
                            word-wrap: break-word;
                            word-break: break-word;
                        }
                        
                        .report-table th {
                            background-color: #e0e0e0;
                            font-weight: bold;
                            text-align: center;
                            vertical-align: middle;
                            white-space: nowrap;
                        }
                        
                        /* Alignment khusus untuk kolom tertentu */
                        .report-table td:first-child {
                            text-align: center;
                            white-space: nowrap;
                        }
                        
                        /* Tanggal columns - center alignment, no wrap */
                        .pasien-table td:nth-child(2),
                        .pasien-table td:nth-child(3),
                        .obat-table td:nth-child(2),
                        .pelayanan-table td:nth-child(2) {
                            text-align: center;
                            white-space: nowrap;
                        }
                        
                        /* No Antri - center alignment */
                        .pasien-table td:nth-child(8) {
                            text-align: center;
                            white-space: nowrap;
                        }
                        
                        /* Qty columns - center alignment */
                        .obat-table td:nth-child(9),
                        .pelayanan-table td:nth-child(8) {
                            text-align: center;
                            white-space: nowrap;
                        }
                        
                        /* Currency columns - right alignment */
                        .pasien-table td:nth-child(11),
                        .obat-table td:nth-child(8),
                        .obat-table td:nth-child(10),
                        .pelayanan-table td:nth-child(7),
                        .pelayanan-table td:nth-child(9) {
                            text-align: right;
                            white-space: nowrap;
                        }
                        
                        .total-row {
                            font-weight: bold;
                            background-color: #f9f9f9;
                        }
                        
                        .total-pendapatan {
                            text-align: center;
                            font-size: 16px;
                            font-weight: bold;
                            margin-top: 20px;
                            padding: 15px;
                            border: 2px solid #000;
                            background-color: #f0f0f0;
                        }
                        
                        .total-pendapatan h3 {
                            margin: 0;
                        }
                    `,
                    scanStyles: false
                });
            } else {
                // Fallback to traditional window.print
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Laporan Kunjungan Klinik</title>
                    </head>
                    <body>
                        ${printHTML}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
            
            // Remove temporary div
            document.body.removeChild(tempDiv);

        } catch (error) {
            console.error('Error saat mencetak laporan:', error);
            alert('Gagal mencetak laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk set tanggal hari ini
    const setTanggalHariIni = () => {
        const today = getTodayDate();
        setTanggalAwal(today);
        setTanggalAkhir(today);
    };

    return (
        <div className="laporan-container">
            {/* Load Print.js from CDN */}
            <script src="https://cdnjs.cloudflare.com/ajax/libs/print-js/1.6.0/print.min.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/print-js/1.6.0/print.min.css" />
            
            <div className="dashboard-header">
                <h1>Laporan Kunjungan</h1>
            </div>

            <div className="dashboard-content">
                <div className="date-range-section">
                    <h2>Pilih Range Tanggal</h2>
                    
                    <div className="date-inputs-container">
                        <div className="date-input-group">
                            <label>Tanggal Awal:</label>
                            <input
                                type="date"
                                value={tanggalAwal}
                                onChange={(e) => handleTanggalAwalChange(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        
                        <div className="date-input-group">
                            <label>Tanggal Akhir:</label>
                            <input
                                type="date"
                                value={tanggalAkhir}
                                onChange={(e) => handleTanggalAkhirChange(e.target.value)}
                                min={tanggalAwal}
                                className="date-input"
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button 
                            onClick={setTanggalHariIni}
                            className="btn-today"
                        >
                            Hari Ini
                        </button>
                        
                        <button 
                            onClick={handleCetak}
                            disabled={loading}
                            className={`btn-cetak ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Memproses...' : 'Cetak Laporan'}
                        </button>
                    </div>

                    <div className="date-preview">
                        <p>
                            <strong>Periode Laporan: </strong>
                            {tanggalAwal === tanggalAkhir 
                                ? formatTanggalIndonesia(tanggalAwal)
                                : `${formatTanggalIndonesia(tanggalAwal)} - ${formatTanggalIndonesia(tanggalAkhir)}`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Laporan;