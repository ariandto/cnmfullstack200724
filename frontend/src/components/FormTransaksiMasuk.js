import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { apiurl } from './api/config';

function FormTransaksiMasuk() {
  const [formData, setFormData] = useState({
    idtransaksi: '',
    idtransaksivarchar: '',
    nopol: '',
    driver: '',
    sumber_barang: '',
    nama_barang: '',
    uom: '',
    qty: ''
  });
  const [token, setToken] = useState('');
  const [expire, setExpire] = useState('');
  const navigate = useNavigate();

  // Fetch a new ID for transaksi
  const fetchNewId = useCallback(async () => {
    if (!token) return; // Exit if no token

    try {
      const response = await axios.get(`${apiurl}/transaksi/latest-id`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setFormData((prevData) => ({
          ...prevData,
          idtransaksi: response.data.idtransaksi,
          idtransaksivarchar: response.data.idtransaksivarchar
        }));
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('Error fetching new transaction ID:', error.response ? error.response.data : error.message);
      alert('Failed to fetch new transaction ID: ' + (error.response ? error.response.data.message : error.message));
    }
  }, [token]);

  // Submit the transaction form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Token is missing. Please log in again.');
      return;
    }

    const currentTimestamp = new Date().toISOString();

    const { idtransaksi, ...restData } = formData; // Exclude idtransaksi if not needed

    const dataToSend = {
      ...restData,
      tanggal_pickup: currentTimestamp
    };

    try {
      const response = await axios.post(`${apiurl}/transaksi`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        alert(response.data.message || 'Transaction created successfully');
        setFormData({
          idtransaksi: '',
          idtransaksivarchar: '',
          nopol: '',
          driver: '',
          sumber_barang: '',
          nama_barang: '',
          uom: '',
          qty: ''
        });
        fetchNewId(); // Fetch a new ID after successful submission
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('Error creating transaction:', error.response ? error.response.data : error.message);
      alert(`Failed to create transaction: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.get(`${apiurl}/token`);
      if (response.data) {
        setToken(response.data.accessToken);
        const decoded = jwtDecode(response.data.accessToken);
        setExpire(decoded.exp);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      navigate("/"); // Redirect if token refresh fails
    }
  }, [navigate]);

  // Token expiration handling and periodic refresh
  useEffect(() => {
    const axiosJWT = axios.create();

    axiosJWT.interceptors.request.use(async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        // Token expired, refresh it
        try {
          const response = await axios.get(`${apiurl}/token`);
          if (response.data) {
            const newToken = response.data.accessToken;
            config.headers.Authorization = `Bearer ${newToken}`;
            setToken(newToken);
            const decoded = jwtDecode(newToken);
            setExpire(decoded.exp);
          } else {
            throw new Error('Invalid response data');
          }
        } catch (error) {
          console.error('Error refreshing token in interceptor:', error);
          navigate("/"); // Redirect if token refresh fails
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // Refresh token and fetch new ID on component mount
    const initialize = async () => {
      await refreshToken();
      if (token) {
        fetchNewId();
      }
    };
    initialize();

    // Periodic refresh every 5 seconds
    const intervalId = setInterval(() => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime() && token) {
        refreshToken();
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [expire, token, navigate, refreshToken, fetchNewId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Form Transaksi Barang Masuk</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-lg">ID Transaksi</label>
          <input
            className="p-2 border rounded"
            type="text"
            name="idtransaksivarchar"
            value={formData.idtransaksivarchar}
            onChange={handleChange}
            placeholder="ID Transaksi akan otomatis terisi"
            readOnly
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-lg">Nopol</label>
          <input
            className="p-2 border rounded"
            type="text"
            name="nopol"
            value={formData.nopol}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-lg">Driver</label>
          <input
            className="p-2 border rounded"
            type="text"
            name="driver"
            value={formData.driver}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-lg">Supplier</label>
          <input
            className="p-2 border rounded"
            type="text"
            name="sumber_barang"
            value={formData.sumber_barang}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-lg">Nama Barang</label>
          <input
            className="p-2 border rounded"
            type="text"
            name="nama_barang"
            value={formData.nama_barang}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-lg">UOM (Satuan)</label>
          <input
            className="p-2 border rounded"
            type="text"
            name="uom"
            value={formData.uom}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-lg">Qty</label>
          <input
            className="p-2 border rounded"
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default FormTransaksiMasuk;
