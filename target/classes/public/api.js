const API_URL = "https://specimen-recliner-credible.ngrok-free.dev";

export const GudangApi = {

    // Katalog
    async getBarang(){
        const response = await fetch(`${API_URL}/api/barang`);
        return await response.json();
    },
    // Riwayat Transaksi
    async getRiwayat(){
        const response = await fetch(`${API_URL}/api/transaksi`);
        const result = await response.json();
    },
    // Delete Transaksi
    async deleteTransaksi(){
        const resp = await fetch(`${API_URL}/api/transaksi/${id}`, { method: 'DELETE' });
        const res = await resp.json();
    },
    // Post Penjualan
    async postPenjualan(){
        const response = await fetch(`${API_URL}/api/transaksi/jual/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku: hargaLaku })
        });
    },
    // Laporan Total
    async getLaporanTotal(){
        const resp = await fetch(`${API_URL}/api/laporan/total`);
        const res = await resp.json();
    },
    // Laporan Bulanan
    async getLaporanBulanan(){
        const resp = await fetch(`${API_URL}/api/laporan/bulanan/${b}/${t}`);
        const res = await resp.json();
    },
    // Login OWNER
    async login(user, password){
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userIn, password: passIn })
        });
    },
    // Input Barang Baru
    async postBarangBaru(){
        const response = await fetch(`${API_URL}/api/barang`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    // Save Barang
    async saveBarang(){
        const response = await fetch(`${API_URL}/api/barang/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    // Booking
    async postBooking(data){
        return await fetch(`${API_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify
        });
    },
    // List Booking
    async getBookingList(){
        const resp = await fetch(`${API_URL}/api/booking/list`);
        const res = await resp.json();
    },
    async bayarBooking(id, hargaLaku) {
        return await fetch(`${API_URL}/api/booking/lunas/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku })
        });
    },
    async cancelBooking(id) {
        return await fetch(`${API_URL}/api/booking/cancel/${id}`, { method: 'POST' });
    }

}