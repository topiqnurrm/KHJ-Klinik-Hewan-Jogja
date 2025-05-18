import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

// Import icons for the table actions
import retribusiIcon from "./gambar/retribusi.png";
import rekamIcon from "./gambar/rekam.png";
import editIcon from "./gambar/edit.png";
import hapusIcon from "./gambar/hapus.png";

import Laporan from '../laporan/laporan.jsx';

// Import popup components
import PopupEditBooking from './popup/popupeditbooking.jsx';
import Popup from '../../admin_nav/popup_nav/popup2.jsx';

// Import API functions
import { getBookingWithRetribusi, deleteBooking } from "../../../../api/api-booking";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ setActiveMenu }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  // Set today's date as the default selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [activeView, setActiveView] = useState('dashboard');
  
  // States for table data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // States for dashboard metrics
  const [visitsCount, setVisitsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [categoryData, setCategoryData] = useState({
    ternak: 0,
    kesayangan: 0,
    unggas: 0
  });
  // Add new state for booking types
  const [bookingTypes, setBookingTypes] = useState({
    onsite: 0,
    houseCall: 0
  });

  // States for popups
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Handle single date selection
  const handleSingleDateChange = (date) => {
    // If a date is selected, clear the date range
    if (date) {
      setDateRange([null, null]);
    }
    setSelectedDate(date);
  };

  // Handle date range selection
  const handleDateRangeChange = (update) => {
    // Only clear the single date when both start and end dates are selected
    if (update[0] && update[1]) {
      setSelectedDate(null);
    }
    setDateRange(update);
  };

  // Format currency helper function
  const formatRupiah = (value) => {
    if (!value) return "Rp0";
    const amount = typeof value === "object" && value.$numberDecimal
      ? parseFloat(value.$numberDecimal)
      : typeof value === "string"
      ? parseFloat(value)
      : value;
    return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
  };

  // Helper function for status styling
  const getStatusClass = (status) => {
    switch (status) {
      case "menunggu respon administrasi":
      case "sedang diperiksa":
      case "dirawat inap":
      case "menunggu pembayaran":
      case "mengambil obat":
        return "status-kuning";
      case "disetujui administrasi":
        return "status-hijau";
      case "ditolak administrasi":
      case "dibatalkan administrasi":
        return "status-merah";
      case "selesai":
        return "status-biru";
      default:
        return "";
    }
  };

  // Format kategori with proper capitalization
  const formatKategori = (kategori) => {
    if (!kategori) return "-";
    if (kategori === "kesayangan / satwa liar") {
      return "Kesayangan / Satwa Liar";
    }
    return kategori.charAt(0).toUpperCase() + kategori.slice(1);
  };

  // Access control functions
  const canAccessRetribusi = (status) => {
    return ["mengambil obat", "selesai"].includes(status);
  };

  const canAccessRekamMedis = (status) => {
    return ["dirawat inap", "menunggu pembayaran", "mengambil obat", "selesai"].includes(status);
  };

  // Navigation functions
  const handleReportClick = () => {
    // Prepare date params for the report
    const dateParams = {};
    if (selectedDate) {
      dateParams.date = selectedDate.toISOString();
    } else if (startDate && endDate) {
      dateParams.startDate = startDate.toISOString();
      dateParams.endDate = endDate.toISOString();
    }
    
    // Switch to report view with date params
    setActiveView('laporan');
    
    // If using the parent component's state management:
    if (setActiveMenu) {
      setActiveMenu("Laporan");
    }
  };

  const handleDataClick = () => {
    // Scroll to table section
    const tableSection = document.querySelector('.dashboard-table-section');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch bookings data
  const fetchBookings = () => {
    setIsLoading(true);
    
    getBookingWithRetribusi()
      .then((data) => {
        // Sort bookings by createdAt field in descending order (newest first)
        const sortedData = [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setIsLoading(false);
      });
  };

  // Initial data fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply date filtering to bookings immediately when data is loaded or date changes
  useEffect(() => {
    if (!bookings.length) return;
    
    // Filter bookings based on date selection
    let filteredData = [...bookings];
    
    if (selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      
      filteredData = filteredData.filter(booking => {
        const bookingDate = new Date(booking.pilih_tanggal);
        return bookingDate >= selectedDateStart && bookingDate <= selectedDateEnd;
      });
    } else if (startDate && endDate) {
      const rangeStart = new Date(startDate);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
      
      filteredData = filteredData.filter(booking => {
        const bookingDate = new Date(booking.pilih_tanggal);
        return bookingDate >= rangeStart && bookingDate <= rangeEnd;
      });
    }
    
    // Apply initial filtering for table view
    setFilteredBookings(filteredData);
    
    // Calculate dashboard metrics based on date filtering
    // Count visits (bookings with specific statuses)
    const visitStatuses = ['sedang diperiksa', 'dirawat inap', 'menunggu pembayaran', 'mengambil obat', 'selesai'];
    const visitCount = filteredData.filter(booking => visitStatuses.includes(booking.status_booking)).length;
    
    // Count bookings (bookings with other specific statuses)
    const bookingStatuses = ['menunggu respon administrasi', 'disetujui administrasi', 'ditolak administrasi', 'dibatalkan administrasi'];
    const bookingCount = filteredData.filter(booking => bookingStatuses.includes(booking.status_booking)).length;
    
    // Calculate booking types counts
    const onsiteCount = filteredData.filter(booking => booking.jenis_layanan === 'onsite').length;
    const houseCallCount = filteredData.filter(booking => booking.jenis_layanan === 'house call').length;
    
    // Calculate category distribution for pie chart
    const categoryDistribution = {
      ternak: 0,
      kesayangan: 0,
      unggas: 0
    };
    
    // Only count visits (not all bookings) for the pie chart
    filteredData
      .filter(booking => visitStatuses.includes(booking.status_booking))
      .forEach(booking => {
        if (booking.kategori === 'ternak') {
          categoryDistribution.ternak += 1;
        } else if (booking.kategori === 'kesayangan / satwa liar') {
          categoryDistribution.kesayangan += 1;
        } else if (booking.kategori === 'unggas') {
          categoryDistribution.unggas += 1;
        }
      });
    
    setVisitsCount(visitCount);
    setBookingsCount(bookingCount);
    setCategoryData(categoryDistribution);
    setBookingTypes({
      onsite: onsiteCount,
      houseCall: houseCallCount
    });
    
  }, [bookings, selectedDate, startDate, endDate]);

  // Generate pie chart data based on category distribution
  const pieData = {
    labels: ['Ternak', 'Kesayangan / Satwa Liar', 'Unggas'],
    datasets: [
      {
        data: [categoryData.ternak, categoryData.kesayangan, categoryData.unggas],
        backgroundColor: ['#E79999', '#719C5E', '#5887C1'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'left',
        align: 'start',
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
    },
  };

  // Handle filtering and sorting for table
  useEffect(() => {
    if (!bookings.length) return;
    
    // Start with date-filtered bookings
    let result = [...bookings];
    
    // Check if both date filters are cleared
    const areBothDateFiltersEmpty = !selectedDate && !startDate && !endDate;
    
    if (!areBothDateFiltersEmpty) {
      if (selectedDate) {
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);
        
        result = result.filter(booking => {
          const bookingDate = new Date(booking.pilih_tanggal);
          return bookingDate >= selectedDateStart && bookingDate <= selectedDateEnd;
        });
      } else if (startDate && endDate) {
        const rangeStart = new Date(startDate);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(endDate);
        rangeEnd.setHours(23, 59, 59, 999);
        
        result = result.filter(booking => {
          const bookingDate = new Date(booking.pilih_tanggal);
          return bookingDate >= rangeStart && bookingDate <= rangeEnd;
        });
      }
    }
    
    // Apply search term filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((booking) => {
        const biayaStr = formatRupiah(booking.biaya);
        const layananStr = (booking.pelayanans1 || [])
          .map((p) => p.nama || p.id_pelayanan?.nama)
          .filter(Boolean)
          .join(", ");
        const catatanStr = (booking.administrasis1 || [])
          .map(a => a.catatan)
          .filter(Boolean)
          .join(", ");
        const latestAdmin = getLatestAdministrasi(booking.administrasis1);
  const userName = latestAdmin?.user_name || "Tidak diketahui";
        const kategoriStr = booking.kategori || "";
        
        const allFields = `
          ${booking.nama || booking.id_pasien?.nama || ""}
          ${booking.keluhan || ""}
          ${booking.status_booking || ""}
          ${catatanStr}
          ${userName}
          ${new Date(booking.createdAt).toLocaleString()}
          ${new Date(booking.updatedAt).toLocaleString()}
          ${biayaStr}
          ${layananStr}
          ${new Date(booking.pilih_tanggal).toLocaleDateString("id-ID")}
          ${booking.alamat || ""}
          ${booking.jenis_layanan || ""}
          ${kategoriStr}
        `.toLowerCase();
  
        return allFields.includes(lower);
      });
    }
    
    // Apply sorting (if selected by user) or maintain default newest-first order
    if (sortBy) {
      result = result.sort((a, b) => {
        let valueA, valueB;
        if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "pilih_tanggal") {
          valueA = new Date(a[sortBy]).getTime();
          valueB = new Date(b[sortBy]).getTime();
        } else if (sortBy === "nama_hewan") {
          valueA = (a.nama || a.id_pasien?.nama || "").toLowerCase();
          valueB = (b.nama || b.id_pasien?.nama || "").toLowerCase();
        } else if (sortBy === "user_name") {
          valueA = (a.administrasis1?.[0]?.user_name || "").toLowerCase();
          valueB = (b.administrasis1?.[0]?.user_name || "").toLowerCase();
        } else if (sortBy === "biaya") {
          const aVal = a.biaya?.$numberDecimal ?? a.biaya ?? 0;
          const bVal = b.biaya?.$numberDecimal ?? b.biaya ?? 0;
          valueA = parseFloat(aVal);
          valueB = parseFloat(bVal);
        } else if (sortBy === "alamat") {
          valueA = (a.alamat || "").toLowerCase();
          valueB = (b.alamat || "").toLowerCase();
        } else if (sortBy === "jenis_layanan") {
          valueA = (a.jenis_layanan || "").toLowerCase();
          valueB = (b.jenis_layanan || "").toLowerCase();
        } else if (sortBy === "kategori") {
          valueA = (a.kategori || "").toLowerCase();
          valueB = (b.kategori || "").toLowerCase();
        }
  
        if (sortOrder === "asc") return valueA > valueB ? 1 : -1;
        return valueA < valueB ? 1 : -1;
      });
    } else {
      // If no sorting is selected by user, maintain newest bookings first
      result = result.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    setFilteredBookings(result);
  }, [bookings, searchTerm, sortBy, sortOrder, selectedDate, startDate, endDate]);

  // Function for handling actions
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setIsEditPopupOpen(true);
  };

  const handleEditClose = (wasUpdated = false) => {
    setIsEditPopupOpen(false);
    setSelectedBooking(null);
    
    // If booking was updated, refresh the data
    if (wasUpdated) {
      fetchBookings();
    }
  };

  const handleDeleteRequest = (booking) => {
    setBookingToDelete(booking);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!bookingToDelete) return;
    
    setIsLoading(true);
    deleteBooking(bookingToDelete._id)
      .then(() => {
        // Refresh the booking list after deletion
        fetchBookings();
        setIsDeletePopupOpen(false);
        setBookingToDelete(null);
      })
      .catch((error) => {
        console.error("Failed to delete booking:", error);
        alert("Failed to delete booking: " + (error.response?.data?.message || error.message));
        setIsDeletePopupOpen(false);
        setBookingToDelete(null);
        setIsLoading(false);
      });
  };

  // Prepare date parameters for Laporan component
  const getLaporanParams = () => {
    const params = {};
    if (selectedDate) {
      params.date = selectedDate;
    } else if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    return params;
  };

  // Get current date display text 
  const getDateDisplayText = () => {
    if (selectedDate) {
      return `tanggal ${selectedDate.toLocaleDateString("id-ID")}`;
    } else if (startDate && endDate) {
      return `rentang tanggal ${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`;
    } else {
      return "Filter tanggal belum dipilih";
    }
  };

  // Render based on active view
  if (activeView === 'laporan') {
    return <Laporan {...getLaporanParams()} setActiveView={setActiveView} />;
  }

  // 4. Helper function to get the latest administration note
  const getLatestAdministrasi = (administrasis) => {
    if (!administrasis || administrasis.length === 0) return null;
    
    // Sort administrasis by date descending (newest first)
    return [...administrasis].sort((a, b) => 
      new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    )[0];
  };

  return (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <h1>Dashboard</h1>
        </div>
        <div className="wadah">
            {/* Search and Date Filter */}
            <div className="search-section">
                <div className="date-picker-group">
                    <div className="date-picker-item">
                        <label>Pilih Tanggal:</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleSingleDateChange}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Tanggal"
                            className="date-picker-input"
                            popperPlacement="bottom"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={15}
                            isClearable
                        />
                    </div>
                    <div className="date-picker-item">
                        <label>Rentang Tanggal:</label>
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateRangeChange}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Pilih Rentang"
                            className="date-picker-input"
                            popperPlacement="bottom"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            yearDropdownItemNumber={15}
                            isClearable
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="cards-section11">
                  <div className="card1">
                      <h2>{visitsCount}</h2>
                      <p>Kunjungan <br/>{selectedDate ? "(Tanggal Ini)" : startDate && endDate ? "(Pada Rentang Ini)" : " (All)"}</p>
                  </div>
                  <div className="card2">
                      <h2>{bookingsCount}</h2>
                      <p>Booking <br/>{selectedDate ? "(Tanggal Ini)" : startDate && endDate ? "(Pada Rentang Ini)" : " (All)"}</p>
                  </div>
                </div>
                <div className="cards-section12">
                  <div className="card3">
                      <h2>{bookingTypes.onsite}</h2>
                      <p>~ Onsite <br/>Booking & kunjungan <br/>{selectedDate ? "(Tanggal Ini)" : startDate && endDate ? "(Pada Rentang Ini)" : " (All)"}</p>
                  </div>
                  <div className="card4">
                      <h2>{bookingTypes.houseCall}</h2>
                      <p>~ House Call <br/>Booking & kunjungan <br/>{selectedDate ? "(Tanggal Ini)" : startDate && endDate ? "(Pada Rentang Ini)" : " (All)"}</p>
                  </div>
                </div>
                <div className="chart-section2">
                  <h3>Presentase Kunjungan Pasien{selectedDate ? " Tanggal Ini" : startDate && endDate ? " Pada Rentang Ini" : ""}</h3>
                  <div className="chart-wrapper">
                      <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="dashboard-table-section">
                <h2>Data Pemeriksaan Pasien</h2>
                
                <div className="table-filter-container">
                <div className="table-search-wrapper">
                    <label className="table-search-label">Filter Data</label>
                    <div className="search-input-wrapper">
                    <input
                        type="text"
                        className="table-search-input"
                        placeholder="Cari data pemeriksaan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="table-clear-button" onClick={() => setSearchTerm("")}>
                        X
                        </button>
                    )}
                    </div>
                </div>

                <div className="table-sort-wrapper">
                    <select
                      className="table-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="">Terbaru</option>
                      <option value="createdAt">Tanggal Buat</option>
                      <option value="updatedAt">Terakhir Update</option>
                      <option value="pilih_tanggal">Tanggal Booking</option>
                      <option value="nama_hewan">Nama Hewan</option>
                      <option value="user_name">Nama Pemilik</option>
                      <option value="biaya">Biaya</option>
                      <option value="alamat">Alamat</option>
                      <option value="jenis_layanan">Jenis Layanan</option>
                      <option value="kategori">Kategori</option>
                    </select>

                    <select
                    className="table-sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                    </select>
                </div>
                </div>

                <div className="table-container">
                {isLoading ? (
                    <div className="loading-indicator">Memuat data...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="no-data-message">
                      Tidak ada data pemeriksaan pasien pada {getDateDisplayText()}
                    </div>
                ) : (
                    <table className="dashboard-table">
                    <thead>
                        <tr>
                        <th>No</th>
                        <th>Tgl Buat</th>
                        <th>Tgl Booking</th>
                        <th>Nama Pemilik</th>
                        <th>Nama Hewan</th>
                        <th>Kategori</th>
                        <th>Keluhan</th>
                        <th>Jenis Layanan</th>
                        <th>Lokasi</th>
                        <th>Layanan</th>
                        <th>Catatan</th>
                        <th>Status</th>
                        <th>Biaya</th>
                        <th>Tgl Update</th>
                        <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking, index) => (
                            <tr key={booking._id}>
                            <td>{index + 1}</td>
                            <td>{new Date(booking.createdAt).toLocaleString()}</td>
                            <td>{new Date(booking.pilih_tanggal).toLocaleDateString("id-ID")}</td>
                            <td>{booking.id_pasien?.id_user?.nama || booking.administrasis1?.[0]?.user_name || "Tidak diketahui"}</td>
                            <td>{booking.nama || booking.id_pasien?.nama || "Tidak diketahui"}</td>
                            <td>{formatKategori(booking.kategori)}</td>
                            <td>{booking.keluhan}</td>
                            <td>{booking.jenis_layanan || "-"}</td>
                            <td>{booking.alamat || "-"}</td>
                            <td>
                                {(booking.pelayanans1 || [])
                                .map((p) => p.nama || p.id_pelayanan?.nama)
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </td>
                            {/* <td>{booking.administrasis1?.[0]?.catatan || "-"}</td> */}
                            <td>{getLatestAdministrasi(booking.administrasis1)?.catatan || "-"}</td>
                            <td>
                                <span className={`status-label ${getStatusClass(booking.status_booking)}`}>
                                {booking.status_booking}
                                </span>
                            </td>
                            <td>{formatRupiah(booking.biaya)}</td>
                            <td>{new Date(booking.updatedAt).toLocaleString()}</td>
                            <td className="table-actions">
                                {[
                                "sedang diperiksa",
                                "dirawat inap",
                                "menunggu pembayaran",
                                "mengambil obat",
                                "selesai",
                                ].includes(booking.status_booking) && (
                                <>
                                    {/* <button 
                                    className={`btn-blue ${canAccessRetribusi(booking.status_booking) ? '' : 'disabled'}`} 
                                    title="Lihat Retribusi" 
                                    onClick={() => canAccessRetribusi(booking.status_booking) && alert(`Lihat retribusi ${booking._id}`)}
                                    disabled={!canAccessRetribusi(booking.status_booking)}
                                    >
                                    <img src={retribusiIcon} alt="retribusi" />
                                    </button>
                                    <button 
                                    className={`btn-blue ${canAccessRekamMedis(booking.status_booking) ? '' : 'disabled'}`} 
                                    title="Rekam Medis" 
                                    onClick={() => canAccessRekamMedis(booking.status_booking) && alert(`Lihat rekam medis ${booking._id}`)}
                                    disabled={!canAccessRekamMedis(booking.status_booking)}
                                    >
                                    <img src={rekamIcon} alt="rekam" />
                                    </button> */}
                                    <button 
                                        className="btn-blue"
                                        title="Rekam Medis"
                                        onClick={() => alert(`Lihat rekam medis ${r._id}`)}
                                    >
                                        <img src={rekamIcon} alt="rekam" />
                                    </button>
                                </>
                                )}

                                {[
                                "menunggu respon administrasi",
                                "disetujui administrasi",
                                "ditolak administrasi",
                                "dibatalkan administrasi",
                                ].includes(booking.status_booking) && (
                                <>
                                    <button 
                                    className="btn-green" 
                                    title="Edit" 
                                    onClick={() => handleEdit(booking)}
                                    >
                                    <img src={editIcon} alt="edit" />
                                    </button>
                                    <button 
                                    className="btn-red" 
                                    title="Hapus" 
                                    onClick={() => handleDeleteRequest(booking)}
                                    disabled={isLoading}
                                    >
                                    <img src={hapusIcon} alt="hapus" />
                                    </button>
                                </>
                                )}
                            </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                )}
                </div>
            </div>
        </div>

        {/* Popups */}
        <PopupEditBooking 
          isOpen={isEditPopupOpen} 
          onClose={handleEditClose} 
          bookingData={selectedBooking} 
        />

        <Popup
          isOpen={isDeletePopupOpen}
          onClose={() => setIsDeletePopupOpen(false)}
          title="Konfirmasi Hapus"
          description={`Apakah Anda yakin ingin menghapus booking untuk ${bookingToDelete?.nama || bookingToDelete?.id_pasien?.nama || 'pasien ini'}?`}
          onConfirm={handleConfirmDelete}
        />
    </div>
  );
};

export default Dashboard;