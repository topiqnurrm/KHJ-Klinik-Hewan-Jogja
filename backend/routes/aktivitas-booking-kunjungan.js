import express from 'express';
import Kunjungan from '../models/kunjungan.js'; // Adjust path as needed
import Booking from '../models/booking.js'; // Adjust path as needed
import mongoose from 'mongoose';

const router = express.Router();

/**
 * IMPORTANT: Fix route paths to match client-side API calls
 * Client is calling:
 * - /api/aktivitas-kunjungan/akvtsbkngknjgn/check/:bookingId
 * - /api/aktivitas-kunjungan/akvtsbkngknjgn
 * - /api/aktivitas-kunjungan/akvtsbkngknjgn/count-today
 */

// Check if a Kunjungan exists for a specific booking ID
router.get('/akvtsbkngknjgn/check/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Validate bookingId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID format' });
        }

        // Find kunjungan by booking ID
        const kunjungan = await Kunjungan.findOne({ id_booking: bookingId });

        if (kunjungan) {
            return res.status(200).json({ 
                success: true, 
                exists: true, 
                kunjungan 
            });
        } else {
            return res.status(200).json({ 
                success: true, 
                exists: false 
            });
        }
    } catch (error) {
        console.error('Error checking kunjungan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error when checking kunjungan', 
            error: error.message 
        });
    }
});

// Create a new Kunjungan record
router.post('/akvtsbkngknjgn', async (req, res) => {
    try {
        const { id_booking, no_antri, ...otherData } = req.body;

        // Validate required fields
        if (!id_booking || !no_antri) {
            return res.status(400).json({ 
                success: false, 
                message: 'Booking ID and queue number are required' 
            });
        }

        // Validate bookingId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id_booking)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid booking ID format' 
            });
        }

        // Check if booking exists
        const booking = await Booking.findById(id_booking);
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }

        // Create new kunjungan
        const newKunjungan = new Kunjungan({
            id_booking,
            no_antri,
            ...otherData
        });

        // Save to database
        const savedKunjungan = await newKunjungan.save();

        // Update booking status if needed
        if (booking.status_booking === 'disetujui administrasi') {
            booking.status_booking = 'sedang diperiksa';
            await booking.save();
        }

        res.status(201).json({
            success: true,
            message: 'Kunjungan created successfully',
            data: savedKunjungan
        });
    } catch (error) {
        console.error('Error creating kunjungan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error when creating kunjungan', 
            error: error.message 
        });
    }
});

// Get count of Kunjungan records created today
router.get('/akvtsbkngknjgn/count-today', async (req, res) => {
    try {
        // Get start and end of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Query for kunjungan records created today
        const count = await Kunjungan.countDocuments({
            tanggal: {
                $gte: today,
                $lt: tomorrow
            }
        });

        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error counting kunjungan records:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error when counting kunjungan records', 
            error: error.message 
        });
    }
});

// Additional route: Get all kunjungan records
router.get('/akvtsbkngknjgn', async (req, res) => {
    try {
        const kunjungans = await Kunjungan.find()
            .populate('id_booking')
            .sort({ tanggal: -1 });
            
        res.status(200).json({
            success: true,
            count: kunjungans.length,
            data: kunjungans
        });
    } catch (error) {
        console.error('Error fetching kunjungan records:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error when fetching kunjungan records', 
            error: error.message 
        });
    }
});

// Get kunjungan by ID
router.get('/akvtsbkngknjgn/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid kunjungan ID format' 
            });
        }
        
        const kunjungan = await Kunjungan.findById(id)
            .populate('id_booking')
            .populate('administrasis2.id_user', 'name email');
            
        if (!kunjungan) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kunjungan not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: kunjungan
        });
    } catch (error) {
        console.error('Error fetching kunjungan by ID:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error when fetching kunjungan', 
            error: error.message 
        });
    }
});

// Update kunjungan (add administrasi entry)
router.patch('/akvtsbkngknjgn/:id/administrasi', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_user, catatan, status_kunjungan } = req.body;
        
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid kunjungan ID format' 
            });
        }
        
        // Validate required fields
        if (!id_user || !catatan || !status_kunjungan) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID, catatan, and status are required' 
            });
        }
        
        // Find kunjungan
        const kunjungan = await Kunjungan.findById(id);
        if (!kunjungan) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kunjungan not found' 
            });
        }
        
        // Add new administrasi entry
        const administrasiEntry = {
            id_user,
            catatan,
            status_kunjungan,
            tanggal: new Date()
        };
        
        kunjungan.administrasis2.push(administrasiEntry);
        
        // Also update the booking status
        const booking = await Booking.findById(kunjungan.id_booking);
        if (booking) {
            booking.status_booking = status_kunjungan;
            await booking.save();
        }
        
        // Save kunjungan
        const updatedKunjungan = await kunjungan.save();
        
        res.status(200).json({
            success: true,
            message: 'Kunjungan updated successfully',
            data: updatedKunjungan
        });
    } catch (error) {
        console.error('Error updating kunjungan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error when updating kunjungan', 
            error: error.message 
        });
    }
});

export default router;