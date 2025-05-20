import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './EditBooking.css';
import { getBookingById, updateBookingStatus, addNoteToBooking } from '../../../../api/api-aktivitas-booking';
import { getPasienByUserId } from '../../../../api/api-pasien';
import { fetchLayanan } from '../../../../api/api-pelayanan';
import { checkBookingAvailability, updateBooking } from '../../../../api/api-booking';
import { checkAndCreateKunjungan } from '../../../../api/aktivitas-booking-kunjungan'; // Add this import

// Icons for buttons
import waitingIcon from "./gambar/menunggu.png";
import rejectIcon from "./gambar/ditolak.png";
import approveIcon from "./gambar/disetujui.png";

import Popup2 from "../../admin_nav/popup_nav/popup2";

// Custom select styles (shortened)
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#ecfcf7",
    border: "1px solid #333",
    borderRadius: "7px",
    padding: "0px 4px",
    fontSize: "0.95rem",
    minHeight: "38px",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "7px",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e0f7ef" : "#fff",
    color: "#333",
  }),
};

// Define the jenis layanan options
const jenisLayananOptions = [
  { value: "onsite", label: "Onsite (Booking Online)" },
  { value: "house call", label: "House Call (Booking Online)" }
];

const EditBooking = ({ booking, onClose, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [pasienData, setPasienData] = useState(null); // Single pasien data
    const [layananOptions, setLayananOptions] = useState([]);
    const [selectedLayanan, setSelectedLayanan] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [monthAvailability, setMonthAvailability] = useState({});
    const [keluhan, setKeluhan] = useState("");
    const [selectedJenisLayanan, setSelectedJenisLayanan] = useState(null);
    const [lokasiPemeriksaan, setLokasiPemeriksaan] = useState("");
    const [isLokasiEditable, setIsLokasiEditable] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    
    // Add these states near the existing state declarations
    const [pendingPersetujuanStatus, setPendingPersetujuanStatus] = useState(null);
    const [pendingCheckInStatus, setPendingCheckInStatus] = useState(null);
    const [showPersetujuanPopup, setShowPersetujuanPopup] = useState(false);
    const [showCheckInPopup, setShowCheckInPopup] = useState(false);
    const [rejectionNote, setRejectionNote] = useState("");
    const [cancellationNote, setCancellationNote] = useState("");
    const [showNotesInput, setShowNotesInput] = useState(false);

    // Client info (not editable)
    const [clientName, setClientName] = useState("");
    
    // Animal category (not editable)
    const [animalCategory, setAnimalCategory] = useState("");
    
    // Animal name (not editable)
    const [animalName, setAnimalName] = useState("");
    
    // Status untuk persetujuan dan check-in
    const [persetujuanStatus, setPersetujuanStatus] = useState('menunggu');
    const [checkInStatus, setCheckInStatus] = useState('menunggu');

    const keluhanTextareaRef = useRef(null);

    // Store original data for comparison
    const [originalData, setOriginalData] = useState({
        pasienId: "",
        layananId: "",
        date: "",
        keluhan: "",
        jenisLayanan: "",
        lokasi: "",
        persetujuanStatus: "",
        checkInStatus: ""
    });

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return "";
        const dateObj = date instanceof Date ? date : new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (!booking) return;
        
        const status = booking.status_administrasi;
        
        // Set initial status values based on booking status
        if (status === 'menunggu respon administrasi') {
            setPersetujuanStatus('menunggu');
            setCheckInStatus('menunggu');
        } 
        else if (status === 'disetujui administrasi') {
            setPersetujuanStatus('disetujui');
            setCheckInStatus('menunggu');
        } 
        else if (status === 'ditolak administrasi') {
            setPersetujuanStatus('ditolak');
            setCheckInStatus('menunggu');
        } 
        else if (status === 'sedang diperiksa') {
            setPersetujuanStatus('disetujui');
            setCheckInStatus('disetujui');
        }
        else if (status === 'dibatalkan administrasi') {
            setPersetujuanStatus('disetujui');
            setCheckInStatus('ditolak');
        }
    }, [booking]);

    useEffect(() => {
        if (booking) {
            loadBookingData();
        }
    }, [booking]);

    // Both loadBookingData and loadLayananData functions fixed to properly handle originalBooking

    const loadBookingData = async () => {
        setIsLoading(true);
        try {
            // Get detailed booking data
            const bookingDetail = await getBookingById(booking._id);
            
            // console.log("Fetched booking detail:", bookingDetail); // Debug log
            
            // Set client name directly from booking
            if (bookingDetail.klien) {
                setClientName(bookingDetail.klien);
            }
            
            // FIXED: Set animal category - prioritize id_pasien.kategori over booking.kategori
            if (bookingDetail.id_pasien && bookingDetail.id_pasien.kategori) {
                setAnimalCategory(bookingDetail.id_pasien.kategori);
            } else if (bookingDetail.kategori) {
                setAnimalCategory(bookingDetail.kategori);
            } else if (bookingDetail.jenis_hewan) {
                setAnimalCategory(bookingDetail.jenis_hewan);
            }
            
            // Set animal name directly from booking
            if (bookingDetail.nama_hewan) {
                setAnimalName(bookingDetail.nama_hewan);
            } else if (bookingDetail.nama) {
                // If the name includes parentheses like "Fluffy (Cat)", extract just the name
                const nameMatch = bookingDetail.nama.match(/^(.+?)(?:\s+\(.+\))?$/);
                setAnimalName(nameMatch ? nameMatch[1] : bookingDetail.nama);
            }
            
            // Set booking date - first check pilih_tanggal then try tanggal_booking
            const bookingDateValue = bookingDetail.pilih_tanggal || bookingDetail.tanggal_booking;
            if (bookingDateValue) {
                const bookingDate = new Date(bookingDateValue);
                setSelectedDate(bookingDate);
                setCalendarMonth(bookingDate);
                setOriginalData(prev => ({ ...prev, date: formatDateForInput(bookingDate) }));
            }
            
            // FIX: Extract keluhan from either direct booking or originalBooking
            if (bookingDetail.keluhan) {
                setKeluhan(bookingDetail.keluhan);
                setOriginalData(prev => ({ ...prev, keluhan: bookingDetail.keluhan }));
            } else if (bookingDetail.originalBooking && bookingDetail.originalBooking.keluhan) {
                // Check if keluhan exists in the originalBooking object
                setKeluhan(bookingDetail.originalBooking.keluhan);
                setOriginalData(prev => ({ ...prev, keluhan: bookingDetail.originalBooking.keluhan }));
            }
            
            // FIX: Extract alamat (examination location) from either direct booking or originalBooking
            if (bookingDetail.alamat) {
                setLokasiPemeriksaan(bookingDetail.alamat);
                setOriginalData(prev => ({
                    ...prev,
                    lokasi: bookingDetail.alamat
                }));
            } else if (bookingDetail.originalBooking && bookingDetail.originalBooking.alamat) {
                // Check if alamat exists in the originalBooking object
                setLokasiPemeriksaan(bookingDetail.originalBooking.alamat);
                setOriginalData(prev => ({
                    ...prev,
                    lokasi: bookingDetail.originalBooking.alamat
                }));
            }
            
            // Handle pasien data - both for direct access and populated objects
            let pasienId = null;
            
            if (bookingDetail.id_pasien) {
                // Check if id_pasien is an object or just an ID string
                if (typeof bookingDetail.id_pasien === 'object' && bookingDetail.id_pasien !== null) {
                    setPasienData(bookingDetail.id_pasien);
                    pasienId = bookingDetail.id_pasien._id;
                    
                    // Set animal data from pasien if not already set
                    if (!animalName && bookingDetail.id_pasien.nama) {
                        setAnimalName(bookingDetail.id_pasien.nama);
                    }
                    
                    // FIXED: Make sure to respect id_pasien.kategori for the animal category
                    if (bookingDetail.id_pasien.kategori) {
                        setAnimalCategory(bookingDetail.id_pasien.kategori);
                    } else if (bookingDetail.id_pasien.jenis) {
                        setAnimalCategory(bookingDetail.id_pasien.jenis);
                    }
                } else if (typeof bookingDetail.id_pasien === 'string') {
                    // If id_pasien is just an ID string, try to fetch the complete pasien data
                    pasienId = bookingDetail.id_pasien;
                    try {
                        // If you have a function to fetch pasien by ID
                        const pasienDetails = await getPasienByUserId(pasienId);
                        if (pasienDetails) {
                            setPasienData(pasienDetails);
                        } else {
                            // If we can't get pasien details, create a minimal object with just the ID
                            setPasienData({ _id: pasienId });
                        }
                    } catch (error) {
                        console.warn('Error fetching pasien details:', error);
                        // Create minimal pasien data with just the ID
                        setPasienData({ _id: pasienId });
                    }
                }
                
                if (pasienId) {
                    setOriginalData(prev => ({ ...prev, pasienId }));
                }
            }
            
            // Load layanan data and set the selected service
            await loadLayananData(bookingDetail);
            
            // Set jenis layanan - first check direct property, then originalBooking
            const jenisLayananValue = bookingDetail.jenis_layanan || 
                                    (bookingDetail.originalBooking && bookingDetail.originalBooking.jenis_layanan);
            
            if (jenisLayananValue) {
                const currentJenisLayanan = jenisLayananOptions.find(option => 
                    option.value === jenisLayananValue
                );
                
                if (currentJenisLayanan) {
                    setSelectedJenisLayanan(currentJenisLayanan);
                    const isHouseCall = currentJenisLayanan.value === "house call";
                    setIsLokasiEditable(isHouseCall);
                    
                    // If we haven't set a location yet, set default based on service type
                    if (!lokasiPemeriksaan) {
                        // Use alamat from booking or originalBooking if it's house call
                        let locationValue = isHouseCall ? 
                            (bookingDetail.alamat || 
                            (bookingDetail.originalBooking && bookingDetail.originalBooking.alamat) || 
                            "") : "Klinik KHJ";
                        
                        setLokasiPemeriksaan(locationValue);
                        
                        setOriginalData(prev => ({
                            ...prev,
                            jenisLayanan: jenisLayananValue,
                            lokasi: locationValue
                        }));
                    }
                }
            }
            
            // Store the full status_administrasi in the booking object for future reference
            // This is important for the check-in button state
            const statusField = bookingDetail.status_booking || bookingDetail.status;
            booking.status_administrasi = statusField;
            
            // Set status values
            if (statusField) {
                // console.log("Setting status based on:", statusField);
                
                // Logic to determine persetujuan status
                let persetujuanValue = 'menunggu';
                if (statusField.includes('disetujui') || statusField === 'dibatalkan administrasi' || statusField === 'sedang diperiksa') {
                    persetujuanValue = 'disetujui';
                } else if (statusField.includes('ditolak')) {
                    persetujuanValue = 'ditolak';
                }
                setPersetujuanStatus(persetujuanValue);
                
                // Logic to determine check-in status
                let checkInValue = 'menunggu';
                if (statusField === 'sedang diperiksa' || statusField === 'selesai') {
                    checkInValue = 'disetujui';
                } else if (statusField === 'dibatalkan administrasi') {
                    checkInValue = 'ditolak';
                }
                setCheckInStatus(checkInValue);
                
                setOriginalData(prev => ({
                    ...prev,
                    persetujuanStatus: persetujuanValue,
                    checkInStatus: checkInValue
                }));
            }
            
            // Fetch availability for the selected month
            fetchMonthAvailability(calendarMonth);
            
        } catch (error) {
            console.error('Error loading booking details:', error);
            showMessage('Gagal memuat detail booking', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Updated loadLayananData to correctly extract service from originalBooking
    const loadLayananData = async (bookingDetail) => {
        try {
            const layananData = await fetchLayanan();
            const sortedLayanan = layananData.sort((a, b) => a.label.localeCompare(b.label));
            setLayananOptions(sortedLayanan);
            
            // Check for pelayanans1 in the main booking object
            let servicePelayanan = null;
            if (bookingDetail.pelayanans1 && bookingDetail.pelayanans1.length > 0) {
                servicePelayanan = bookingDetail.pelayanans1[0];
            } 
            // If not found, check in originalBooking
            else if (bookingDetail.originalBooking && 
                    bookingDetail.originalBooking.pelayanans1 && 
                    bookingDetail.originalBooking.pelayanans1.length > 0) {
                servicePelayanan = bookingDetail.originalBooking.pelayanans1[0];
            }
            
            // If we found a service, try to match it with our options
            if (servicePelayanan) {
                // console.log("Found service in booking:", servicePelayanan);
                
                // FIXED: More robust ID extraction
                let serviceId;
                if (typeof servicePelayanan.id_pelayanan === 'object' && servicePelayanan.id_pelayanan?._id) {
                    serviceId = servicePelayanan.id_pelayanan._id;
                } else {
                    serviceId = servicePelayanan.id_pelayanan;
                }
                    
                // console.log("Looking for service ID:", serviceId);
                
                // First try to find service by ID
                let foundService = sortedLayanan.find(l => l.value === serviceId);
                
                // If not found by ID and we have a name, try matching by name
                if (!foundService && servicePelayanan.nama) {
                    foundService = sortedLayanan.find(l => 
                        l.label.toLowerCase() === servicePelayanan.nama.toLowerCase() ||
                        l.label.toLowerCase().includes(servicePelayanan.nama.toLowerCase()) ||
                        servicePelayanan.nama.toLowerCase().includes(l.label.toLowerCase())
                    );
                }
                
                // If we found a match, select it
                if (foundService) {
                    // console.log("Found matching service in options:", foundService);
                    setSelectedLayanan(foundService);
                    setOriginalData(prev => ({ ...prev, layananId: foundService.value }));
                } else {
                    // console.log("Service not found in options:", servicePelayanan);
                }
            } else {
                console.log("No service found in booking data");
            }
        } catch (error) {
            console.error("Gagal mengambil data layanan:", error);
        }
    };

    const fetchMonthAvailability = async (date) => {
        if (!date) return;
        
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const promises = [];
        const bookingId = booking?._id;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const current = new Date(year, month, day);
            const dateStr = formatDateForInput(current);
            promises.push(
                checkBookingAvailability(dateStr, bookingId)
                    .then((res) => ({ date: dateStr, tersedia: res.tersedia }))
                    .catch(() => ({ date: dateStr, tersedia: null }))
            );
        }
        
        const results = await Promise.all(promises);
        const availMap = {};
        results.forEach(({ date, tersedia }) => {
            availMap[date] = tersedia;
        });
        
        setMonthAvailability(availMap);
    };
    
    // Handle ESC key and prevent body scrolling
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    // Update lokasi when jenis layanan changes
    useEffect(() => {
        if (selectedJenisLayanan) {
            const isHouseCall = selectedJenisLayanan.value === "house call";
            setIsLokasiEditable(isHouseCall);
            
            if (isHouseCall) {
                if (!lokasiPemeriksaan && booking?.alamat) {
                    setLokasiPemeriksaan(booking.alamat);
                }
            } else {
                setLokasiPemeriksaan("Klinik KHJ");
            }
        }
    }, [selectedJenisLayanan, booking, lokasiPemeriksaan]);

    // Fetch availability when calendar month changes
    useEffect(() => {
        if (calendarMonth) {
            fetchMonthAvailability(calendarMonth);
        }
    }, [calendarMonth]);

    const hasDataChanged = () => {
        const currentLayananId = selectedLayanan?.value || "";
        const currentDate = formatDateForInput(selectedDate);
        const currentKeluhan = keluhan;
        const currentJenisLayanan = selectedJenisLayanan?.value || "";
        const currentLokasi = lokasiPemeriksaan;
        
        // Add status changes to the check
        const hasStatusChanged = 
            (pendingPersetujuanStatus && pendingPersetujuanStatus !== persetujuanStatus) ||
            (pendingCheckInStatus && pendingCheckInStatus !== checkInStatus);
        
        return (
            currentLayananId !== originalData.layananId ||
            currentDate !== originalData.date ||
            currentKeluhan !== originalData.keluhan ||
            currentJenisLayanan !== originalData.jenisLayanan ||
            currentLokasi !== originalData.lokasi ||
            hasStatusChanged
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "keluhan") {
            setKeluhan(value);
        } else if (name === "lokasi") {
            setLokasiPemeriksaan(value);
        }
    };

    // Add a useEffect to refocus the textarea if it's the active element when the component re-renders
    useEffect(() => {
        // Check if the textarea was focused before the re-render
        if (document.activeElement === keluhanTextareaRef.current) {
            // Re-focus the textarea and place cursor at the end
            const length = keluhanTextareaRef.current.value.length;
            keluhanTextareaRef.current.focus();
            keluhanTextareaRef.current.setSelectionRange(length, length);
        }
    }, [keluhan]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setCalendarMonth(date);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Show message with auto-hide
    const showMessage = (message, type = 'error', duration = 2000) => {
        setValidationMessage(message);
        setMessageType(type);
        setTimeout(() => {
            setValidationMessage("");
            setMessageType("");
        }, duration);
    };

    // Function to get day class name for DatePicker
    const getDayClassName = (date) => {
        const dateStr = formatDateForInput(date);
        const slot = monthAvailability[dateStr];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) return "red-day";
        if (slot === 0) return "red-day";
        
        if (selectedDate && 
            date.getDate() === selectedDate.getDate() && 
            date.getMonth() === selectedDate.getMonth() && 
            date.getFullYear() === selectedDate.getFullYear()) {
            return "highlighted-day";
        }
        
        if (typeof slot === "number") return "green-day";
        
        return "";
    };

    const validateForm = () => {
        // Check if required fields are filled
        if (!selectedLayanan) {
            showMessage("Harap pilih layanan terlebih dahulu!");
            return false;
        }
        
        if (!selectedDate) {
            showMessage("Harap pilih tanggal terlebih dahulu!");
            return false;
        }
        
        if (!keluhan || keluhan.trim() === "") {
            showMessage("Harap isi keluhan terlebih dahulu!");
            return false;
        }
        
        if (!selectedJenisLayanan) {
            showMessage("Harap pilih jenis layanan terlebih dahulu!");
            return false;
        }
        
        // Validate pasienData existence
        if (!pasienData) {
            // console.warn("Data pasien tidak ditemukan!");
            // Depending on your requirements, you might want to continue anyway
            // or you could return false to prevent submission
        }
        
        // Check keluhan length
        if (keluhan.length > 250) {
            showMessage("Keluhan maksimal 250 karakter.");
            return false;
        }
        
        // Check if house call has location
        if (selectedJenisLayanan.value === "house call" && (!lokasiPemeriksaan || lokasiPemeriksaan.trim() === "")) {
            showMessage("Alamat untuk house call tidak boleh kosong.");
            return false;
        }
        
        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(selectedDate);
        bookingDate.setHours(0, 0, 0, 0);
        
        if (bookingDate < today) {
            showMessage("Tanggal booking tidak boleh lebih kecil dari hari ini.");
            return false;
        }
        
        // Check availability
        const dateStr = formatDateForInput(selectedDate);
        if (monthAvailability[dateStr] === 0) {
            showMessage("Kuota penuh pada tanggal tersebut. Pilih tanggal lain.");
            return false;
        }
        
        // Check if any data has changed
        if (!hasDataChanged()) {
            showMessage("Tidak ada perubahan data booking.");
            return false;
        }
        
        return true;
    };

    const submitChanges = async () => {
        setIsLoading(true);
        
        try {
            const dateStr = formatDateForInput(selectedDate);
            
            // Final check of availability
            const availabilityCheck = await checkBookingAvailability(dateStr, booking?._id);
            if (availabilityCheck.tersedia === 0) {
                showMessage("Kuota penuh pada tanggal tersebut. Pilih tanggal lain.");
                setIsLoading(false);
                return;
            }
            
            // Create update object
            const updateObject = {
                pilih_tanggal: dateStr,
                keluhan: keluhan,
                pelayanans1: [{ id_pelayanan: selectedLayanan.value }],
                jenis_layanan: selectedJenisLayanan.value
            };
            
            // Handle status changes, if any
            let newStatusBooking = booking?.status_administrasi || "menunggu respon administrasi";
            
            // Apply persetujuan status changes if pending
            if (pendingPersetujuanStatus && pendingPersetujuanStatus !== persetujuanStatus) {
                if (pendingPersetujuanStatus === 'disetujui') {
                    newStatusBooking = 'disetujui administrasi';
                    
                    // Add default approval note
                    await addNoteToBooking(booking._id, {
                        id_user: JSON.parse(localStorage.getItem("user"))?._id || 'current_user_id',
                        catatan: "-",
                        status_administrasi: 'disetujui administrasi'
                    });
                } else if (pendingPersetujuanStatus === 'ditolak') {
                    newStatusBooking = 'ditolak administrasi';
                    
                    // Add rejection note
                    const noteContent = rejectionNote || "Jenis hewan belum tersedia";
                    await addNoteToBooking(booking._id, {
                        id_user: JSON.parse(localStorage.getItem("user"))?._id || 'current_user_id',
                        catatan: noteContent,
                        status_administrasi: 'ditolak administrasi'
                    });
                }
            }
            
            // Apply check-in status changes if pending
            if (pendingCheckInStatus && pendingCheckInStatus !== checkInStatus) {
                if (pendingCheckInStatus === 'disetujui') {
                    newStatusBooking = 'sedang diperiksa';
                    
                    // Add default check-in note
                    await addNoteToBooking(booking._id, {
                        id_user: JSON.parse(localStorage.getItem("user"))?._id || 'current_user_id',
                        catatan: "-",
                        status_administrasi: 'sedang diperiksa'
                    });

                    // Check if kunjungan exists and create one if it doesn't
                    try {
                        await checkAndCreateKunjungan(booking._id, {
                            administrasis2: [{
                                id_user: JSON.parse(localStorage.getItem("user"))?._id || 'current_user_id',
                                catatan: "Menunggu Antrian",
                                status_kunjungan: "sedang diperiksa"
                            }]
                        });
                    } catch (error) {
                        console.error("Error creating kunjungan:", error);
                    }
                } else if (pendingCheckInStatus === 'ditolak') {
                    newStatusBooking = 'dibatalkan administrasi';
                    
                    // Add cancellation note
                    const noteContent = cancellationNote || "Klien tidak datang";
                    await addNoteToBooking(booking._id, {
                        id_user: JSON.parse(localStorage.getItem("user"))?._id || 'current_user_id',
                        catatan: noteContent,
                        status_administrasi: 'dibatalkan administrasi'
                    });
                }
            }
            
            // Add status to update object
            updateObject.status_booking = newStatusBooking;
            
            // Only add id_pasien if pasienData exists and has _id
            if (pasienData && pasienData._id) {
                updateObject.id_pasien = pasienData._id;
            } else if (booking && booking.id_pasien) {
                // Fallback to booking.id_pasien if available
                updateObject.id_pasien = typeof booking.id_pasien === 'object' ? 
                    booking.id_pasien._id : booking.id_pasien;
            }
            
            // Add alamat field only for house call
            if (selectedJenisLayanan.value === "house call") {
                updateObject.alamat = lokasiPemeriksaan;
            }
            
            // Update booking
            const updatedBooking = await updateBooking(booking._id, updateObject);
            
            // After successful update, update the local state
            if (pendingPersetujuanStatus) {
                setPersetujuanStatus(pendingPersetujuanStatus);
                setPendingPersetujuanStatus(null);
            }
            
            if (pendingCheckInStatus) {
                setCheckInStatus(pendingCheckInStatus);
                setPendingCheckInStatus(null);
            }
            
            showMessage("Data booking berhasil diperbarui!", "success");
            
            // Update original data to match the new data
            setOriginalData({
                pasienId: pasienData?._id || "",
                layananId: selectedLayanan?.value || "",
                date: formatDateForInput(selectedDate),
                keluhan: keluhan,
                jenisLayanan: selectedJenisLayanan?.value || "",
                lokasi: lokasiPemeriksaan,
                persetujuanStatus: pendingPersetujuanStatus || persetujuanStatus,
                checkInStatus: pendingCheckInStatus || checkInStatus
            });
            
            // Notify parent component of the update
            onUpdate(updatedBooking);
            
            setTimeout(() => {
                setIsLoading(false);
                onClose();
            }, 2000);
            
        } catch (error) {
            console.error('Error saat memperbarui booking:', error);
            showMessage(error.message || 'Terjadi kesalahan saat memperbarui booking');
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        
        // Check if we need to show a confirmation popup before proceeding
        if (pendingPersetujuanStatus && pendingPersetujuanStatus !== persetujuanStatus) {
            if (pendingPersetujuanStatus === 'ditolak') {
                setShowNotesInput(true);
                return; // Stop here and wait for note input
            } else if (pendingPersetujuanStatus === 'disetujui') {
                setShowPersetujuanPopup(true);
                return; // Stop here and wait for confirmation
            }
        }
        
        // Check if we need to show check-in popup
        if (pendingCheckInStatus && pendingCheckInStatus !== checkInStatus) {
            if (pendingCheckInStatus === 'ditolak') {
                setShowNotesInput(true);
                return; // Stop here and wait for note input
            } else if (pendingCheckInStatus === 'disetujui') {
                setShowCheckInPopup(true);
                return; // Stop here and wait for confirmation
            }
        }
        
        // If we get here, either no status changes or they've been confirmed
        await submitChanges();
    };

    // const handlePersetujuan = (status) => {
    //     // Just set the pending status without showing popup
    //     setPendingPersetujuanStatus(status);
    // };

    const handlePersetujuan = (status) => {
        // Just set the pending status without showing popup
        setPendingPersetujuanStatus(status);
        
        // Clear check-in status if persetujuan is set to 'ditolak'
        if (status === 'ditolak') {
            setCheckInStatus('menunggu');
            setPendingCheckInStatus('menunggu');
        }
    };

    const handleCheckIn = (status) => {
        // Set the pending check-in status
        setPendingCheckInStatus(status);
        
        // Automatically set the persetujuan UI to disetujui when any check-in button is clicked
        // But don't set pendingPersetujuanStatus to avoid sending this data
        if (persetujuanStatus !== 'disetujui') {
            // This is UI-only change - we're not setting pendingPersetujuanStatus
            setPersetujuanStatus('disetujui');
        }
    };

    const isCheckInDisabled = () => {
        // Check if persetujuan (including pending status) is not approved
        const currentPersetujuanStatus = pendingPersetujuanStatus || persetujuanStatus;
        return currentPersetujuanStatus !== 'disetujui' || booking?.status_administrasi === 'menunggu respon administrasi';
    };

    const NotesInput = ({ isOpen, onClose, title, defaultNote, onConfirm, onChange }) => {
        const textareaRef = useRef(null);
        
        // Focus the textarea when the popup opens
        useEffect(() => {
            if (isOpen && textareaRef.current) {
                textareaRef.current.focus();
            }
        }, [isOpen]);
        
        // Store the original dimensions to avoid reset on re-render
        useEffect(() => {
            if (isOpen && textareaRef.current) {
                // Apply saved dimensions from localStorage if they exist
                const savedHeight = localStorage.getItem('notesTextareaHeight');
                const savedWidth = localStorage.getItem('notesTextareaWidth');
                
                if (savedHeight) {
                    textareaRef.current.style.height = savedHeight;
                }
                
                if (savedWidth) {
                    textareaRef.current.style.width = savedWidth;
                }
                
                // Set up resize event listener to save dimensions
                const handleResize = () => {
                    if (textareaRef.current) {
                        const computedStyle = window.getComputedStyle(textareaRef.current);
                        localStorage.setItem('notesTextareaHeight', computedStyle.height);
                        localStorage.setItem('notesTextareaWidth', computedStyle.width);
                    }
                };
                
                // Use ResizeObserver instead of resize event
                const resizeObserver = new ResizeObserver(handleResize);
                resizeObserver.observe(textareaRef.current);
                
                return () => {
                    if (textareaRef.current) {
                        resizeObserver.unobserve(textareaRef.current);
                    }
                };
            }
        }, [isOpen]);
        
        // Maintain focus after each keystroke
        useEffect(() => {
            if (isOpen && textareaRef.current && document.activeElement === textareaRef.current) {
                const length = textareaRef.current.value.length;
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                        textareaRef.current.setSelectionRange(length, length);
                    }
                }, 0);
            }
        }, [defaultNote, isOpen]);
        
        if (!isOpen) return null;
        
        return ReactDOM.createPortal(
            <div className="popup-overlay2-admin">
                <div className="popup-content">
                    <h2>{title}</h2>
                    <textarea 
                        className="notes-textarea"
                        placeholder="Masukkan catatan...(Jenis hewan belum tersedia / Klien tidak datang)"
                        value={defaultNote}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        ref={textareaRef}
                    />
                    <div className="popup-buttons">
                        <button className="popup-button cancel" onClick={onClose}>Batal</button>
                        <button className="popup-button confirm" onClick={onConfirm}>Konfirmasi</button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };
    
    // const isPersetujuanDisabled = () => {
    //     // Only disable persetujuan buttons if check-in status is active but not the booking status
    //     return (
    //         (checkInStatus === 'disetujui' && booking?.status_administrasi !== 'sedang diperiksa') ||
    //         (checkInStatus === 'ditolak' && booking?.status_administrasi === 'dibatalkan administrasi')
    //     );
    // };

    const isPersetujuanDisabled = () => {
        // Only disable persetujuan buttons in specific cases
        return (
            (checkInStatus === 'disetujui' && booking?.status_administrasi !== 'sedang diperiksa')
            // Remove this condition to allow persetujuan buttons to be clickable when status is "dibatalkan administrasi"
            // (checkInStatus === 'ditolak' && booking?.status_administrasi === 'dibatalkan administrasi')
        );
    };

    const handleConfirmPersetujuan = () => {
        setShowPersetujuanPopup(false);
        // Continue with submission after confirmation
        submitChanges();
    };

    const handleConfirmCheckIn = () => {
        // If check-in is approved, set persetujuan to approved if it wasn't already
        if (pendingCheckInStatus === 'disetujui' && persetujuanStatus !== 'disetujui') {
            setPersetujuanStatus('disetujui');
            setPendingPersetujuanStatus('disetujui');
        }
        
        setShowCheckInPopup(false);
        // Continue with submission after confirmation
        submitChanges();
    };

    const handleNotesConfirm = () => {
        if (pendingPersetujuanStatus === 'ditolak') {
            setPersetujuanStatus('ditolak');
        } else if (pendingCheckInStatus === 'ditolak') {
            // When check-in is rejected, ensure persetujuan is approved
            setPersetujuanStatus('disetujui');
            setPendingPersetujuanStatus('disetujui');
            setCheckInStatus('ditolak');
        }
        
        setShowNotesInput(false);
        // Continue with submission after notes are provided
        submitChanges();
    };

    // Create the modal content
    return ReactDOM.createPortal(
        <div className="edit-booking-overlay-aktivitasbkng" onClick={handleBackdropClick}>
            <div className="edit-booking-container" aria-modal="true" role="dialog">
                <div className="edit-booking-header">
                    <h2>Edit Booking - {animalName || 'Hewan'} ({clientName || 'Klien'})</h2>
                    <button className="close-button" onClick={onClose} aria-label="Tutup">&times;</button>
                </div>
                
                <div className="edit-booking-content">
                    {/* {isLoading && <div className="loading-text">Memuat data...</div>} */}
                    
                    <div className="booking-form">
                        {/* Status control buttons */}
                        <div className="booking-status-section">
                            <div className="status-row">
                                <div className="status-group">
                                    <label>Status Persetujuan</label>
                                    <div className="status-buttons">
                                        <button 
                                            className={`status-button ${persetujuanStatus === 'menunggu' && !pendingPersetujuanStatus ? 'active' : ''} ${pendingPersetujuanStatus === 'menunggu' ? 'active pending' : ''}`} 
                                            onClick={() => handlePersetujuan('menunggu')}
                                            disabled={isLoading || persetujuanStatus !== 'menunggu' || 
                                                ['dibatalkan administrasi', 'sedang diperiksa'].includes(booking?.status_administrasi)}
                                        >
                                            <img src={waitingIcon} alt="Menunggu" className="menunggu" />
                                        </button>

                                        <button 
                                            className={`status-button ${persetujuanStatus === 'ditolak' && !pendingPersetujuanStatus ? 'active' : ''} ${pendingPersetujuanStatus === 'ditolak' ? 'active pending' : ''}`} 
                                            onClick={() => handlePersetujuan('ditolak')}
                                            disabled={isLoading || isPersetujuanDisabled()}
                                        >
                                            <img src={rejectIcon} alt="Ditolak" className="status-icon" />
                                        </button>

                                        <button 
                                            className={`status-button ${persetujuanStatus === 'disetujui' && !pendingPersetujuanStatus ? 'active' : ''} ${pendingPersetujuanStatus === 'disetujui' ? 'active pending' : ''}`} 
                                            onClick={() => handlePersetujuan('disetujui')}
                                            disabled={isLoading || isPersetujuanDisabled()}
                                        >
                                            <img src={approveIcon} alt="Disetujui" className="status-icon" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="status-group">
                                    <label>Status Check-in</label>
                                    <div className="status-buttons">
                                        {/* <button 
                                            className={`status-button ${checkInStatus === 'menunggu' && !pendingCheckInStatus ? 'active' : ''} ${pendingCheckInStatus === 'menunggu' ? 'active pending' : ''}`} 
                                            onClick={() => handleCheckIn('menunggu')}
                                            disabled={isLoading || isCheckInDisabled()}
                                        >
                                            <img src={waitingIcon} alt="Menunggu" className="menunggu" />
                                        </button> */}

                                        <button 
                                            className={`status-button ${checkInStatus === 'ditolak' && !pendingCheckInStatus ? 'active' : ''} ${pendingCheckInStatus === 'ditolak' ? 'active pending' : ''}`} 
                                            onClick={() => handleCheckIn('ditolak')}
                                            disabled={isLoading || isCheckInDisabled()}
                                        >
                                            <img src={rejectIcon} alt="Ditolak" className="status-icon" />
                                        </button>

                                        <button 
                                            className={`status-button ${checkInStatus === 'disetujui' && !pendingCheckInStatus ? 'active' : ''} ${pendingCheckInStatus === 'disetujui' ? 'active pending' : ''}`} 
                                            onClick={() => handleCheckIn('disetujui')}
                                            disabled={isLoading || isCheckInDisabled()}
                                        >
                                            <img src={approveIcon} alt="Disetujui" className="status-icon" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Client and Animal Information (Non-editable) */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nama Klien</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Kategori Hewan</label>
                                <input
                                    type="text"
                                    value={animalCategory}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nama Hewan</label>
                                <input
                                    type="text"
                                    value={animalName}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="layanan">Pilih Layanan *</label>
                                <Select
                                    styles={customSelectStyles}
                                    options={layananOptions}
                                    placeholder="Pilih Layanan"
                                    onChange={setSelectedLayanan}
                                    value={selectedLayanan}
                                    isDisabled={isLoading}
                                    id="layanan"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="tanggal_booking">Pilih Waktu Pemeriksaan *</label>
                                <div className="date-input-container">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={handleDateChange}
                                        onMonthChange={(date) => setCalendarMonth(date)}
                                        dayClassName={getDayClassName}
                                        minDate={new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Pilih tanggal"
                                        className="datepicker-custom"
                                        disabled={isLoading}
                                        renderCustomHeader={({
                                            date, changeYear, changeMonth,
                                            decreaseMonth, increaseMonth,
                                            prevMonthButtonDisabled, nextMonthButtonDisabled,
                                        }) => (
                                        <div className="datepicker-header">
                                            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>{"<"}</button>
                                            <select 
                                                value={date.getFullYear()} 
                                                onChange={({ target: { value } }) => changeYear(Number(value))}
                                            >
                                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <select 
                                                value={date.getMonth()} 
                                                onChange={({ target: { value } }) => changeMonth(Number(value))}
                                            >
                                                {[
                                                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                                                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                                                ].map((month, index) => (
                                                    <option key={month} value={index}>{month}</option>
                                                ))}
                                            </select>
                                            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>{">"}</button>
                                        </div>
                                        )}
                                    />
                                </div>
                                {selectedDate && typeof monthAvailability[formatDateForInput(selectedDate)] === "number" && (
                                    <div className={`kuota-info ${monthAvailability[formatDateForInput(selectedDate)] === 0 ? "full" : "available"}`}>
                                        {monthAvailability[formatDateForInput(selectedDate)] === 0
                                            ? "Kuota penuh pada tanggal ini. Silakan pilih tanggal lain."
                                            : `Tersisa ${monthAvailability[formatDateForInput(selectedDate)]} slot booking tersedia.`}
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="keluhan">Keluhan Pasien *</label>
                                <textarea
                                    id="keluhan"
                                    name="keluhan"
                                    value={keluhan}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan keluhan (maks. 250 karakter)"
                                    disabled={isLoading}
                                    rows={3}
                                    ref={keluhanTextareaRef} // Add the ref here
                                />
                                <div style={{ textAlign: "right", fontSize: "0.85rem", color: keluhan.length > 240 ? "#c00" : "#666" }}>
                                    {keluhan.length}/250
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="jenis_layanan">Jenis Layanan *</label>
                                <Select
                                    styles={customSelectStyles}
                                    options={jenisLayananOptions}
                                    placeholder="Pilih Jenis Layanan"
                                    onChange={setSelectedJenisLayanan}
                                    value={selectedJenisLayanan}
                                    isDisabled={isLoading}
                                    id="jenis_layanan"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lokasi">Lokasi Pemeriksaan *</label>
                                {isLokasiEditable ? (
                                    <input
                                        type="text"
                                        id="lokasi"
                                        name="lokasi"
                                        value={lokasiPemeriksaan}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan alamat pemeriksaan"
                                        disabled={isLoading}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        id="lokasi"
                                        name="lokasi"
                                        value="Klinik KHJ"
                                        disabled
                                        className="disabled-input"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="action-buttons">
                    {validationMessage && (
                        <div className={`validation-message ${messageType}`}>
                            {validationMessage}
                        </div>
                    )}
                    <div className='button-group'>
                        <button 
                            className="cancel-button" 
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Batal
                        </button>
                        
                        <button 
                            className="save-button" 
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </div>
            
            <Popup2 
                isOpen={showPersetujuanPopup}
                onClose={() => setShowPersetujuanPopup(false)}
                title="Konfirmasi Persetujuan"
                description="Apakah Anda yakin ingin menyetujui booking ini?"
                onConfirm={handleConfirmPersetujuan}
            />

            <Popup2 
                isOpen={showCheckInPopup}
                onClose={() => setShowCheckInPopup(false)}
                title="Konfirmasi Check-In"
                description="Booking akan dihapus dari daftar booking dan akan dilanjutkan ke kunjungan. Lanjutkan?"
                onConfirm={handleConfirmCheckIn}
            />

            {/* Keep the NotesInput components as they are */}
            <NotesInput 
                isOpen={showNotesInput && pendingPersetujuanStatus === 'ditolak'}
                onClose={() => setShowNotesInput(false)}
                title="Masukkan Catatan Penolakan"
                defaultNote={rejectionNote}
                onChange={setRejectionNote}
                onConfirm={handleNotesConfirm}
            />

            <NotesInput 
                isOpen={showNotesInput && pendingCheckInStatus === 'ditolak'}
                onClose={() => setShowNotesInput(false)}
                title="Masukkan Catatan Pembatalan"
                defaultNote={cancellationNote}
                onChange={setCancellationNote}
                onConfirm={handleNotesConfirm}
            />
        </div>,
        document.body
    );
};

export default EditBooking;