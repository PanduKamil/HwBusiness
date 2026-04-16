const API_URL = "https://specimen-recliner-credible.ngrok-free.dev";

export const GudangApi = {

    // Katalog
    async getBarang() {
        const response = await fetch(`${API_URL}/api/barang`);
        return await response.json();
    },

    // Riwayat Transaksi
    async getRiwayat() {
        const response = await fetch(`${API_URL}/api/transaksi`);
        return await response.json();
    },

    // Delete Transaksi (Butuh ID)
    async deleteTransaksi(id) {
        try {
            const resp = await fetch(`${API_URL}/api/transaksi/${id}`, { method: 'DELETE' });
            const result = await resp.json();

            if (!resp.ok) {
                throw new Error(result.message || "Gagal delete Transaksi di server");
            }
            return result;
        } catch (error) {
            console.error("API Error [deleteTransaksi]:", error.message);
         throw error;
        }
        
    },

    // Post Penjualan (Butuh ID dan Harga)
    async postPenjualan(id, hargaLaku) {
        try {
            const response = await fetch(`${API_URL}/api/transaksi/jual/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku: hargaLaku })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Gagal proses penjualan di server");
        }
        return result;
        } catch (error) {
            console.error("API Error [Penjualan]:", error.message);
         throw error; 
        }
        
    },

    // Laporan
    async getLaporanTotal() {
        const resp = await fetch(`${API_URL}/api/laporan/total`);
        return await resp.json();
    },

    async getLaporanBulanan(b, t) {
        const resp = await fetch(`${API_URL}/api/laporan/bulanan/${b}/${t}`);
        return await resp.json();
    },

    // Login (Pake parameter yang dioper dari app.js)
    async login(user, password) {
        return await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, password })
        });
    },

    // Input Barang Baru
    async postBarangBaru(data) {
        const response =  await fetch(`${API_URL}/api/barang`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // Edit/Update Barang
    async saveBarang(id, data) {
        const response = await fetch(`${API_URL}/api/barang/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // Booking
    async postBooking(idBarang, nama, tanggal) {
        const response = await fetch(`${API_URL}/api/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(({
                idBarang: idBarang,
                nama: nama,
                jumlah: 1, 
                tanggal: tanggal
            }))
        });
        return await response.json();
    },

    async getBookingList() {
        const resp = await fetch(`${API_URL}/api/booking/list`);
        return await resp.json();
    },

    async bayarBooking(id, hargaLaku) {
        try {
            const response =  await fetch(`${API_URL}/api/booking/lunas/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Gagal proses pelunasan di server");
        }
        return result;

        } catch (error) {
         console.error("API Error [Bayar Booking]:", error.message);
         throw error;   
        }
    },

    async cancelBooking(id) {
        return await fetch(`${API_URL}/api/booking/cancel/${id}`, { method: 'POST' });
    }
};