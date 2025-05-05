import axios from 'axios';

// Update the API_URL to match your backend routes
const API_URL = 'http://localhost:5000/api/aktivitas-kunjungan';

/**
 * Checks if a Kunjungan exists for a booking ID and creates one if it doesn't
 * @param {string} bookingId - The ID of the booking
 * @param {Object} kunjunganData - Additional data for the kunjungan
 * @returns {Promise<Object>} - The kunjungan data
 */
export const checkAndCreateKunjungan = async (bookingId, kunjunganData) => {
    try {
        // First check if a kunjungan record already exists for this booking
        const checkResponse = await axios.get(`${API_URL}/akvtsbkngknjgn/check/${bookingId}`);
        
        // If kunjungan exists, return it
        if (checkResponse.data && checkResponse.data.exists) {
            console.log('Kunjungan already exists:', checkResponse.data.kunjungan);
            return checkResponse.data.kunjungan;
        }
        
        // console.log('Creating new kunjungan for booking:', bookingId);
        
        // If not, create a new kunjungan
        // Generate queue number
        const queueNumber = await generateQueueNumber();
        
        // Create kunjungan data object with current date
        const newKunjungan = {
            ...kunjunganData,
            id_booking: bookingId,
            no_antri: queueNumber,
            tanggal: new Date()
        };
        
        // Post the new kunjungan
        const createResponse = await axios.post(`${API_URL}/akvtsbkngknjgn`, newKunjungan);
        // console.log('Kunjungan created successfully:', createResponse.data);
        return createResponse.data;
        
    } catch (error) {
        console.error('Error in checkAndCreateKunjungan:', error.response?.data || error.message);
        
        // If we get a 404 on the check endpoint, try creating directly
        if (error.response && error.response.status === 404 && error.response.config.url.includes('/check/')) {
            try {
                console.log('Check endpoint not found, trying direct creation');
                const queueNumber = await generateQueueNumber();
                
                const newKunjungan = {
                    ...kunjunganData,
                    id_booking: bookingId,
                    no_antri: queueNumber,
                    tanggal: new Date()
                };
                
                const createResponse = await axios.post(`${API_URL}/akvtsbkngknjgn`, newKunjungan);
                console.log('Direct kunjungan creation succeeded:', createResponse.data);
                return createResponse.data;
            } catch (createError) {
                console.error('Direct creation also failed:', createError.response?.data || createError.message);
                throw createError;
            }
        }
        
        throw error;
    }
};

/**
 * Generates a queue number in the format [Day Letter][Time Segment][Sequential Number]
 * where Day Letter is A-G (A for Monday, G for Sunday)
 * Time Segment is 1-3 (1: 7am-11am, 2: 11am-3pm, 3: 3pm-6pm, 0: other times)
 * @returns {Promise<string>} - The generated queue number
 */
const generateQueueNumber = async () => {
    try {
        // Get current date to check for existing kunjungan records today
        const today = new Date();
        
        // Get day of week (0-6 where 0 is Sunday)
        const dayOfWeek = today.getDay();
        // Convert to letter A-G (where A is Monday, G is Sunday)
        const dayLetter = String.fromCharCode(65 + ((dayOfWeek + 6) % 7)); // Convert 0-6 to A-G
        
        // Get current hour to determine time segment
        const currentHour = today.getHours();
        let timeSegment;
        
        if (currentHour >= 7 && currentHour < 11) {
            timeSegment = '1';
        } else if (currentHour >= 11 && currentHour < 15) {
            timeSegment = '2';
        } else if (currentHour >= 15 && currentHour < 18) {
            timeSegment = '3';
        } else {
            timeSegment = '0';
        }
        
        try {
            // Get today's kunjungan count
            const response = await axios.get(`${API_URL}/akvtsbkngknjgn/count-today`);
            const count = response.data.count + 1; // Add 1 to get the next number
            
            // Format: [Day Letter][Time Segment][Sequential Number]
            return `${dayLetter}${timeSegment}${count.toString().padStart(2, '0')}`;
        } catch (countError) {
            console.warn('Error getting kunjungan count, using default:', countError.message);
            return `${dayLetter}${timeSegment}01`; // Default to 01 if count fails
        }
        
    } catch (error) {
        console.error('Error generating queue number:', error);
        // Fallback queue number if process fails
        const today = new Date();
        const dayOfWeek = today.getDay();
        const dayLetter = String.fromCharCode(65 + ((dayOfWeek + 6) % 7));
        return `${dayLetter}001`;
    }
};

/**
 * Updates an existing kunjungan with administration data
 * @param {string} kunjunganId - The ID of the kunjungan to update
 * @param {Object} adminData - The administration data
 * @returns {Promise<Object>} - The updated kunjungan
 */
export const updateKunjunganStatus = async (kunjunganId, adminData) => {
    try {
        const response = await axios.patch(
            `${API_URL}/akvtsbkngknjgn/${kunjunganId}/administrasi`, 
            adminData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating kunjungan status:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gets all kunjungan records
 * @returns {Promise<Array>} - Array of kunjungan records
 */
export const getAllKunjungan = async () => {
    try {
        const response = await axios.get(`${API_URL}/akvtsbkngknjgn`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching all kunjungan:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Gets a specific kunjungan by ID
 * @param {string} kunjunganId - The ID of the kunjungan
 * @returns {Promise<Object>} - The kunjungan data
 */
export const getKunjunganById = async (kunjunganId) => {
    try {
        const response = await axios.get(`${API_URL}/akvtsbkngknjgn/${kunjunganId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching kunjungan by ID:', error.response?.data || error.message);
        throw error;
    }
};