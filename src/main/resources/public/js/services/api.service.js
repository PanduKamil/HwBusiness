/**
 * @file api.service.js
 * @description Service layer for all backend API calls (Java/Javalin).
 * Centralizes fetch logic, error handling, and JSON body construction.
 * All financial values are kept as strings to preserve BigDecimal precision
 * from the Java backend.
 */

const API_BASE_URL = "https://diecastbusiness-production.up.railway.app";

/**
 * Core fetch wrapper.
 * @param {string} endpoint - API path (e.g. "/api/barang")
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
async function apiFetch(endpoint, options = {}) {
    const defaultHeaders = { "Content-Type": "application/json" };
    const config = {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // For endpoints that return plain text (e.g. old postBarangBaru)
    const contentType = response.headers.get("Content-Type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : { success: response.ok, message: await response.text() };

    if (!response.ok) {
        const errMsg = data.message || `HTTP Error: ${response.status}`;
        throw new Error(errMsg);
    }
    return data;
}

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

/**
 * Authenticate as owner.
 * @param {string} user
 * @param {string} password
 * @returns {Promise<Response>} Raw response (ok/not-ok for 401 check)
 */
export async function login(user, password) {
    return fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
    });
}

// ─────────────────────────────────────────────
//  BARANG (INVENTORY)
// ─────────────────────────────────────────────

/** @returns {Promise<{success:boolean, data: Array}>} */
export async function getBarang() {
    return apiFetch("/api/barang");
}

/**
 * @param {{ nama: string, hargaModal: string, hargaPerkiraanJual: string, stok: number }} data
 * NOTE: hargaModal and hargaPerkiraanJual are sent as strings to preserve
 * BigDecimal precision on the Java backend. Parse with new BigDecimal(str) in Java.
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function postBarangBaru(data) {
    return apiFetch("/api/barang", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * @param {number} id
 * @param {{ nama: string, hargaModal: string, hargaPerkiraanJual: string }} data
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function updateBarang(id, data) {
    return apiFetch(`/api/barang/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// ─────────────────────────────────────────────
//  TRANSAKSI
// ─────────────────────────────────────────────

/** @returns {Promise<{success:boolean, data: Array}>} */
export async function getRiwayat() {
    return apiFetch("/api/transaksi");
}

/**
 * @param {number} id - Barang ID
 * @param {string} hargaLaku - Kept as string for BigDecimal precision
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function postPenjualan(id, hargaLaku) {
    return apiFetch(`/api/transaksi/jual/${id}`, {
        method: "POST",
        body: JSON.stringify({ hargaLaku: String(hargaLaku) }),
    });
}

/**
 * @param {number} id - Transaksi ID
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function deleteTransaksi(id) {
    return apiFetch(`/api/transaksi/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────
//  LAPORAN (FINANCIAL REPORTS)
// ─────────────────────────────────────────────

/** @returns {Promise<{success:boolean, data: LaporanData}>} */
export async function getLaporanTotal() {
    return apiFetch("/api/laporan/total");
}

/**
 * @param {number} bulan - 1–12
 * @param {number} tahun - e.g. 2026
 * @returns {Promise<{success:boolean, data: LaporanData}>}
 */
export async function getLaporanBulanan(bulan, tahun) {
    return apiFetch(`/api/laporan/bulanan/${bulan}/${tahun}`);
}

// ─────────────────────────────────────────────
//  BOOKING
// ─────────────────────────────────────────────

/** @returns {Promise<{success:boolean, data: Array}>} */
export async function getBookingList() {
    return apiFetch("/api/booking/list");
}

/**
 * @param {number} idBarang
 * @param {string} nama
 * @param {string} tanggal - ISO date YYYY-MM-DD
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function postBooking(idBarang, nama, tanggal) {
    return apiFetch("/api/booking", {
        method: "POST",
        body: JSON.stringify({ idBarang, nama, jumlah: 1, tanggal }),
    });
}

/**
 * @param {number} id - Booking ID
 * @param {string} hargaLaku - String for BigDecimal precision
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function bayarBooking(id, hargaLaku) {
    return apiFetch(`/api/booking/lunas/${id}`, {
        method: "POST",
        body: JSON.stringify({ hargaLaku: String(hargaLaku) }),
    });
}

/**
 * @param {number} id - Booking ID
 * @returns {Promise<{success:boolean, message:string}>}
 */
export async function cancelBooking(id) {
    return apiFetch(`/api/booking/cancel/${id}`, { method: "POST" });
}

// ─────────────────────────────────────────────
//  KEUANGAN (THREE POCKETS SYSTEM)
// ─────────────────────────────────────────────

/**
 * Mengambil ringkasan saldo dari Tiga Loket sekaligus (Modal, Profit, Reseller).
 * Mengembalikan data saldo saat ini dan rekor all-time.
 * @returns {Promise<{
 * success: boolean, 
 * data: {
 * danaBelanjaModal: string,
 * profitSaatIni: string,
 * profitAllTime: string,
 * komisiSaatIni: string,
 * komisiAllTime: string
 * }
 * }>}
 */
export async function getDashboardKeuangan() {
    return apiFetch("/api/keuangan/dashboard-summary");
}

/**
 * Mengambil seluruh lembar catatan log transaksi kas secara utuh untuk tabel audit.
 * @returns {Promise<{success: boolean, data: Array<{
 * id_kas: number,
 * tanggal: string,
 * tipe_kas: string,
 * dompet: string,
 * jumlah: number,
 * keterangan: string
 * }>}>}
 */
export async function getRiwayatMutasiKas() {
    return apiFetch("/api/keuangan/arus-kas/riwayat");
}

/**
 * Melakukan aksi penarikan dana/pencairan seluruh profit owner saat ini (Reset ke Rp0).
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetProfitOwner() {
    return apiFetch("/api/keuangan/profit-owner/reset", {
        method: "POST"
    });
}

/**
 * Melakukan aksi penarikan dana/pencairan seluruh komisi reseller saat ini (Reset ke Rp0).
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetKomisiReseller() {
    return apiFetch("/api/keuangan/komisi-reseller/reset", {
        method: "POST"
    });
}