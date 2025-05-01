// File: api-produk.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchProduk = async () => {
    try {
        const response = await axios.get(`${API_URL}/produk`);
        return response.data;
    } catch (error) {
        console.error('Error fetching produk data:', error);
        throw error;
    }
};

export const fetchProdukById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/produk/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching produk with id ${id}:`, error);
        throw error;
    }
};

export const createProduk = async (produkData) => {
    try {
        const response = await axios.post(`${API_URL}/produk`, produkData);
        return response.data;
    } catch (error) {
        console.error('Error creating produk:', error);
        throw error;
    }
};

export const updateProduk = async (id, produkData) => {
    try {
        const response = await axios.put(`${API_URL}/produk/${id}`, produkData);
        return response.data;
    } catch (error) {
        console.error(`Error updating produk with id ${id}:`, error);
        throw error;
    }
};

export const deleteProduk = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/produk/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting produk with id ${id}:`, error);
        throw error;
    }
};