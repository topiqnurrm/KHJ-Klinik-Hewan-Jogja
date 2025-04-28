import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import icons for the table actions - you'll need to provide these images
import retribusiIcon from "./gambar/retribusi.png";
import rekamIcon from "./gambar/rekam.png";
import editIcon from "./gambar/edit.png";
import hapusIcon from "./gambar/hapus.png";

// Import API functions - adjust as needed for your actual API
import { getBookingWithRetribusi, deleteBooking } from "../../../../api/api-booking";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  // States for table data
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const pieData = {
    labels: ['Ternak', 'Kesayangan / Satwa Liar', 'Unggas'],
    datasets: [
      {
        data: [30, 50, 20],
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

  // Access control functions
  const canAccessRetribusi = (status) => {
    return ["mengambil obat", "selesai"].includes(status);
  };

  const canAccessRekamMedis = (status) => {
    return ["dirawat inap", "menunggu pembayaran", "mengambil obat", "selesai"].includes(status);
  };

  // Fetch bookings data
  const fetchBookings = () => {
    setIsLoading(true);
    
    getBookingWithRetribusi()
      .then((data) => {
        setBookings(data);
        setFilteredBookings(data);
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

  // Handle filtering and sorting
  useEffect(() => {
    if (!bookings.length) return;

    const lower = searchTerm.toLowerCase();
    let result = bookings.filter((booking) => {
      const biayaStr = formatRupiah(booking.biaya);
      const layananStr = (booking.pelayanans1 || [])
        .map((p) => p.nama || p.id_pelayanan?.nama)
        .filter(Boolean)
        .join(", ");
      const catatanStr = (booking.administrasis1 || [])
        .map(a => a.catatan)
        .filter(Boolean)
        .join(", ");
      const userName = booking.administrasis1?.[0]?.user_name || "Tidak diketahui";
      
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
      `.toLowerCase();

      return allFields.includes(lower);
    });

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
        }

        if (sortOrder === "asc") return valueA > valueB ? 1 : -1;
        return valueA < valueB ? 1 : -1;
      });
    }

    setFilteredBookings(result);
  }, [searchTerm, bookings, sortBy, sortOrder]);

  // Filter bookings based on dates
  useEffect(() => {
    if (!bookings.length) return;
    
    let result = [...bookings];
    
    // Filter by single date if selected
    if (selectedDate) {
      const selectedDateStr = selectedDate.toDateString();
      result = result.filter(booking => {
        const bookingDate = new Date(booking.pilih_tanggal);
        return bookingDate.toDateString() === selectedDateStr;
      });
    }
    
    // Filter by date range if selected
    if (startDate && endDate) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.pilih_tanggal);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
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
        const userName = booking.administrasis1?.[0]?.user_name || "Tidak diketahui";
        
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
        `.toLowerCase();

        return allFields.includes(lower);
      });
    }
    
    // Apply sorting
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
        }

        if (sortOrder === "asc") return valueA > valueB ? 1 : -1;
        return valueA < valueB ? 1 : -1;
      });
    }
    
    setFilteredBookings(result);
  }, [bookings, searchTerm, sortBy, sortOrder, selectedDate, startDate, endDate]);

  // Function for handling actions
  const handleEdit = (booking) => {
    alert(`Edit booking for ${booking.nama || booking.id_pasien?.nama}`);
    // Add your edit logic here
  };

  const handleDelete = (booking) => {
    if (window.confirm(`Are you sure you want to delete booking for ${booking.nama || booking.id_pasien?.nama}?`)) {
      deleteBooking(booking._id)
        .then(() => {
          // Refresh the booking list after deletion
          fetchBookings();
        })
        .catch((error) => {
          console.error("Failed to delete booking:", error);
          alert("Failed to delete booking: " + (error.response?.data?.message || error.message));
        });
    }
  };

  return (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <h1>Manajemen</h1>
        </div>
        <div className="wadah">
            {/* Search and Date Filter */}
            <div className="search-section">
                {/* <input
                type="text"
                placeholder="Cari pasien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                /> */}
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
                <div className="cards-section1">
                <div className="card">
                    <h2>2</h2>
                    <p>Kunjungan Pasien Hari Ini</p>
                    <button>Laporan {'>'}</button>
                </div>
                <div className="card">
                    <h2>1</h2>
                    <p>Booking Hari Ini</p>
                    <button>Data {'>'}</button>
                </div>
                </div>
                <div className="chart-section2">
                <h3>Presentase Kunjungan Pasien</h3>
                <div className="chart-wrapper">
                    <Pie data={pieData} options={pieOptions} />
                </div>
                </div>
            </div>

            {/* New Table Section */}
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
                    <option value="">Urutkan...</option>
                    <option value="createdAt">Tanggal Buat</option>
                    <option value="updatedAt">Terakhir Update</option>
                    <option value="pilih_tanggal">Tanggal Booking</option>
                    <option value="nama_hewan">Nama Hewan</option>
                    <option value="user_name">Nama Pemilik</option>
                    <option value="biaya">Biaya</option>
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
                ) : (
                    <table className="dashboard-table">
                    <thead>
                        <tr>
                        <th>No</th>
                        <th>Tgl Buat</th>
                        <th>Tgl Booking</th>
                        <th>Nama Hewan</th>
                        <th>Nama Pemilik</th>
                        <th>Keluhan</th>
                        <th>Biaya</th>
                        <th>Catatan</th>
                        <th>Layanan</th>
                        <th>Status</th>
                        <th>Tgl Update</th>
                        <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length === 0 ? (
                        <tr>
                            <td colSpan="12" className="no-data">Tidak ada data booking</td>
                        </tr>
                        ) : (
                        filteredBookings.map((booking, index) => (
                            <tr key={booking._id}>
                            <td>{index + 1}</td>
                            <td>{new Date(booking.createdAt).toLocaleString()}</td>
                            <td>{new Date(booking.pilih_tanggal).toLocaleDateString("id-ID")}</td>
                            <td>{booking.nama || booking.id_pasien?.nama || "Tidak diketahui"}</td>
                            <td>{booking.id_pasien?.id_user?.nama || booking.administrasis1?.[0]?.user_name || "Tidak diketahui"}</td>
                            <td>{booking.keluhan}</td>
                            <td>{formatRupiah(booking.biaya)}</td>
                            <td>{booking.administrasis1?.[0]?.catatan || "-"}</td>
                            <td>
                                {(booking.pelayanans1 || [])
                                .map((p) => p.nama || p.id_pelayanan?.nama)
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </td>
                            <td>
                                <span className={`status-label ${getStatusClass(booking.status_booking)}`}>
                                {booking.status_booking}
                                </span>
                            </td>
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
                                    <button 
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
                                    onClick={() => handleDelete(booking)}
                                    disabled={isLoading}
                                    >
                                    <img src={hapusIcon} alt="hapus" />
                                    </button>
                                </>
                                )}
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;