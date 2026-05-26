/**
 * @file sanitize.utils.js
 * @description XSS prevention & client-side input validation.
 * All user-generated strings rendered into the DOM must be passed
 * through `sanitizeText()` before insertion.
 */

/**
 * Strips HTML tags from a string to prevent XSS when injecting into innerHTML.
 * Use this on ANY value originating from the API or user input before
 * inserting into a template literal that uses innerHTML.
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeText(value) {
    if (value === null || value === undefined) return "";
    const str = String(value);
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Format a number as Indonesian Rupiah, preserving BigDecimal string precision.
 * Accepts both number and string (from Java BigDecimal serialized as string).
 * @param {string|number} value
 * @returns {string}
 */
export function formatRupiah(value) {
    // Parse as float; avoid floating point drift by rounding to 2 decimal places
    const num = Math.round(parseFloat(value) * 100) / 100;
    if (isNaN(num)) return "Rp 0";
    return "Rp " + num.toLocaleString("id-ID");
}

/**
 * Parse a string from a financial input field to a string safe for BigDecimal.
 * Returns null if the value is empty or non-numeric.
 * @param {string} raw
 * @returns {string|null}
 */
export function parseFinancialInput(raw) {
    const cleaned = String(raw).trim().replace(/,/g, ".");
    const num = parseFloat(cleaned);
    if (isNaN(num) || num < 0) return null;
    // Return as string to keep precision when Java parses with new BigDecimal(str)
    return num.toFixed(2);
}

/**
 * Validate the "Input Barang" form.
 * @param {{ nama: string, hargaModal: string, hargaPerkiraanJual: string, stok: string }} fields
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBarangForm({ nama, hargaModal, hargaPerkiraanJual, stok }) {
    const errors = [];

    if (!nama || nama.trim().length < 2) errors.push("Nama barang minimal 2 karakter.");
    if (nama && nama.trim().length > 200) errors.push("Nama barang maksimal 200 karakter.");

    if (parseFinancialInput(hargaModal) === null) errors.push("Harga modal harus angka positif.");
    if (parseFinancialInput(hargaPerkiraanJual) === null) errors.push("Harga jual harus angka positif.");

    const stokNum = parseInt(stok, 10);
    if (isNaN(stokNum) || stokNum < 0) errors.push("Stok harus angka non-negatif.");

    return { valid: errors.length === 0, errors };
}

/**
 * Validate the "Edit Barang" form.
 * @param {{ nama: string, hargaModal: string, hargaPerkiraanJual: string }} fields
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEditBarangForm({ nama, hargaModal, hargaPerkiraanJual }) {
    const errors = [];
    if (!nama || nama.trim().length < 2) errors.push("Nama barang minimal 2 karakter.");
    if (parseFinancialInput(hargaModal) === null) errors.push("Harga modal harus angka positif.");
    if (parseFinancialInput(hargaPerkiraanJual) === null) errors.push("Harga jual harus angka positif.");
    return { valid: errors.length === 0, errors };
}

/**
 * Validate the login form.
 * @param {string} user
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLoginForm(user, password) {
    const errors = [];
    if (!user || user.trim().length === 0) errors.push("Username tidak boleh kosong.");
    if (!password || password.length === 0) errors.push("Password tidak boleh kosong.");
    return { valid: errors.length === 0, errors };
}

/**
 * Validate a financial sale/booking payment input.
 * @param {string} harga
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateHargaInput(harga) {
    const errors = [];
    const parsed = parseFinancialInput(harga);
    if (parsed === null) errors.push("Harga harus berupa angka positif.");
    return { valid: errors.length === 0, errors };
}

/**
 * Validate a booking date string.
 * @param {string} tanggal - Expected format YYYY-MM-DD
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTanggalBooking(tanggal) {
    const errors = [];
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(tanggal);
    if (!iso) { errors.push("Format tanggal: YYYY-MM-DD."); return { valid: false, errors }; }
    const d = new Date(tanggal);
    if (isNaN(d.getTime())) { errors.push("Tanggal tidak valid."); }
    else if (d < new Date()) { errors.push("Tanggal janji bayar tidak boleh di masa lalu."); }
    return { valid: errors.length === 0, errors };
}
