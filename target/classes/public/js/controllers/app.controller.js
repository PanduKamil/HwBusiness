/**
 * @file app.controller.js
 * @description Main application controller.
 * - Initializes all sections via event delegation (no inline onclick).
 * - Implements loading states, button debouncing, and robust error handling.
 * - All state mutations go through service calls; DOM is updated after await.
 */

import * as Api from "../services/api.service.js";
import {
    validateLoginForm,
    validateBarangForm,
    validateEditBarangForm,
    validateHargaInput,
    validateTanggalBooking,
    parseFinancialInput,
} from "../utils/sanitize.utils.js";
import {
    showSection,
    showSkeleton,
    showSpinner,
    setButtonLoading,
    showToast,
    openModal,
    closeModal,
    debounce,
    filterCards,
} from "../utils/ui.utils.js";
import {
    templateCardOwner,
    templateCardReseller,
    templateCardRiwayat,
    templateCardBooking,
} from "../utils/templates.js";

// ─────────────────────────────────────────────
//  MODULE-SCOPED STATE
// ─────────────────────────────────────────────
// No globals — all state stays in this module.
let _isOwnerLoggedIn = false;

// ─────────────────────────────────────────────
//  DATA LOADERS (async, with skeleton/spinner)
// ─────────────────────────────────────────────

async function loadKatalogOwner() {
    const container = document.getElementById("owner-list-cards");
    if (!container) return;
    showSkeleton(container, 4);
    try {
        const res = await Api.getBarang();
        if (!res.success) throw new Error(res.message);
        container.innerHTML =
            res.data.length === 0
                ? `<p class="text-center text-on-surface-variant font-mono text-xs py-8">Gudang kosong.</p>`
                : res.data.map(templateCardOwner).join("");
    } catch (err) {
        container.innerHTML = `<p class="text-center text-error font-mono text-xs py-8">Gagal memuat: ${err.message}</p>`;
    }
}

async function loadKatalogReseller() {
    const container = document.getElementById("reseller-list-cards");
    if (!container) return;
    showSkeleton(container, 4);
    try {
        const res = await Api.getBarang();
        if (!res.success) throw new Error(res.message);
        container.innerHTML =
            res.data.length === 0
                ? `<p class="text-center text-on-surface-variant font-mono text-xs py-8">Gudang kosong.</p>`
                : res.data.map(templateCardReseller).join("");
    } catch (err) {
        container.innerHTML = `<p class="text-center text-error font-mono text-xs py-8">Gagal memuat: ${err.message}</p>`;
    }
}

async function loadRiwayat() {
    const container = document.getElementById("riwayat-list-cards");
    if (!container) return;
    showSkeleton(container, 3);
    try {
        const res = await Api.getRiwayat();
        if (!res.success) throw new Error(res.message);
        container.innerHTML =
            res.data.length === 0
                ? `<p class="text-center text-on-surface-variant font-mono text-xs py-8">Belum ada transaksi.</p>`
                : res.data.map(templateCardRiwayat).join("");
    } catch (err) {
        container.innerHTML = `<p class="text-center text-error font-mono text-xs py-8">Gagal memuat: ${err.message}</p>`;
    }
}

async function loadLaporanTotal() {
    const section = document.getElementById("laporan-keuangan-section");
    if (!section) return;
    const display = section.querySelector("laporan-display-area");
    if (display) showSpinner(display, "Mengambil laporan...");
    try {
        const res = await Api.getLaporanTotal();
        if (res.success) renderLaporan(res.data);
    } catch (err) {
        showToast("Gagal memuat laporan: " + err.message, "error");
    }
}

async function loadDaftarBooking() {
    const container = document.getElementById("booking-list-cards");
    if (!container) return;
    showSkeleton(container, 3);
    try {
        const res = await Api.getBookingList();
        container.innerHTML =
            res.success && res.data.length > 0
                ? res.data.map(templateCardBooking).join("")
                : `<p class="text-center text-on-surface-variant font-mono text-xs py-8">Tidak ada booking aktif.</p>`;
    } catch (err) {
        container.innerHTML = `<p class="text-center text-error font-mono text-xs py-8">Gagal memuat: ${err.message}</p>`;
    }
}

// ─────────────────────────────────────────────
//  SECTION NAVIGATION
// ─────────────────────────────────────────────

function navigate(sectionId) {
    showSection(sectionId);
    // Auto-refresh data on enter
    if (sectionId === "owner-menu" || sectionId === "katalog-barang") loadKatalogOwner();
    if (sectionId === "reseller-menu") loadKatalogReseller();
    if (sectionId === "riwayat-transaksi-section") loadRiwayat();
    if (sectionId === "booking-menu") loadDaftarBooking();
    if (sectionId === "laporan-keuangan-section") loadLaporanTotal();
}

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

async function handleOwnerLogin() {
    const btn = document.getElementById("btn-login");
    const userEl = document.getElementById("login-user");
    const passEl = document.getElementById("login-password");

    const { valid, errors } = validateLoginForm(userEl.value, passEl.value);
    if (!valid) { showToast(errors.join(" "), "warning"); return; }

    const restore = setButtonLoading(btn, "Masuk...");
    try {
        const response = await Api.login(userEl.value.trim(), passEl.value);
        if (response.ok) {
            _isOwnerLoggedIn = true;
            showToast("Login berhasil!", "success");
            userEl.value = "";
            passEl.value = "";
            navigate("owner-menu");
        } else {
            showToast("Username atau password salah.", "error");
        }
    } catch (err) {
        showToast("Gagal koneksi ke server. Cek backend Java.", "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  INPUT BARANG BARU
// ─────────────────────────────────────────────

async function handleInputBarang() {
    const btn = document.getElementById("btn-simpan-barang");
    const namaEl = document.getElementById("namaBarang");
    const modalEl = document.getElementById("hargaModal");
    const jualEl = document.getElementById("hargaJual");
    const stokEl = document.getElementById("stok");

    const raw = {
        nama: namaEl.value.trim(),
        hargaModal: modalEl.value,
        hargaPerkiraanJual: jualEl.value,
        stok: stokEl.value,
    };

    const { valid, errors } = validateBarangForm(raw);
    if (!valid) { showToast(errors.join(" "), "warning"); return; }

    const restore = setButtonLoading(btn, "Menyimpan...");
    try {
        const payload = {
            nama: raw.nama,
            hargaModal: parseFinancialInput(raw.hargaModal),
            hargaPerkiraanJual: parseFinancialInput(raw.hargaPerkiraanJual),
            stok: parseInt(raw.stok, 10),
        };
        const res = await Api.postBarangBaru(payload);
        showToast(res.message || "Barang berhasil disimpan!", "success");
        namaEl.value = modalEl.value = jualEl.value = stokEl.value = "";
        navigate("owner-menu");
    } catch (err) {
        showToast("Gagal simpan: " + err.message, "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  EDIT BARANG (MODAL)
// ─────────────────────────────────────────────

function openModalEdit(id, nama, modal, jual) {
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-nama").value = nama;
    document.getElementById("edit-modal").value = modal;
    document.getElementById("edit-jual").value = jual;
    openModal("modal-edit");
}

async function handleSimpanPerubahan() {
    const btn = document.getElementById("btn-simpan-edit");
    const id = document.getElementById("edit-id").value;
    const raw = {
        nama: document.getElementById("edit-nama").value.trim(),
        hargaModal: document.getElementById("edit-modal").value,
        hargaPerkiraanJual: document.getElementById("edit-jual").value,
    };

    const { valid, errors } = validateEditBarangForm(raw);
    if (!valid) { showToast(errors.join(" "), "warning"); return; }

    const restore = setButtonLoading(btn, "Menyimpan...");
    try {
        const payload = {
            nama: raw.nama,
            hargaModal: parseFinancialInput(raw.hargaModal),
            hargaPerkiraanJual: parseFinancialInput(raw.hargaPerkiraanJual),
        };
        await Api.updateBarang(id, payload);
        showToast("Data berhasil diupdate!", "success");
        closeModal("modal-edit");
        loadKatalogOwner();
    } catch (err) {
        showToast("Gagal update: " + err.message, "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  PENJUALAN (MODAL LAPOR)
// ─────────────────────────────────────────────

function openModalLapor(id, nama, hargaSaran) {
    document.getElementById("lapor-id").value = id;
    document.getElementById("lapor-info-barang").textContent = `${nama} — Saran: ${
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(hargaSaran)
    }`;
    document.getElementById("lapor-harga-input").value = hargaSaran;
    openModal("modal-lapor");
}

async function handleEksekusiLapor() {
    const btn = document.getElementById("btn-konfirmasi-lapor");
    const id = document.getElementById("lapor-id").value;
    const harga = document.getElementById("lapor-harga-input").value;

    const { valid, errors } = validateHargaInput(harga);
    if (!valid) { showToast(errors.join(" "), "warning"); return; }

    const restore = setButtonLoading(btn, "Memproses...");
    try {
        const res = await Api.postPenjualan(id, harga);
        showToast(res.message || "Penjualan berhasil!", "success");
        closeModal("modal-lapor");
        loadKatalogReseller();
    } catch (err) {
        showToast("Gagal: " + err.message, "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  BATALKAN TRANSAKSI
// ─────────────────────────────────────────────

async function handleBatalkanTransaksi(id, btn) {
    if (!confirm("Yakin batalkan transaksi ini? Tindakan tidak bisa diurungkan.")) return;
    const restore = setButtonLoading(btn, "Membatalkan...");
    try {
        const res = await Api.deleteTransaksi(id);
        showToast(res.message || "Transaksi dibatalkan.", "info");
        loadRiwayat();
    } catch (err) {
        showToast("Gagal: " + err.message, "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  LAPORAN KEUANGAN
// ─────────────────────────────────────────────

function renderLaporan(data) {
    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    const fmt = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(v);

    setEl("display-omset", fmt(data.omset));
    setEl("display-komisi", fmt(data.komisi));
    setEl("display-profit", fmt(data.profit));
    setEl("display-modal", fmt(data.modal));
    setEl("display-periode", data.periode || "-");

    const profit = parseFloat(data.profit);
    const modal = parseFloat(data.modal);
    const roi = modal > 0 ? (profit / modal) * 100 : 0;
    const roiEl = document.getElementById("display-roi");
    if (roiEl) {
        roiEl.textContent = roi.toFixed(2) + "%";
        roiEl.className = roi > 20
            ? "font-mono text-2xl text-tertiary profit-pulse"
            : roi >= 10
            ? "font-mono text-2xl text-yellow-400"
            : "font-mono text-2xl text-error";
    }
}

async function handleLaporanFilter() {
    const btn = document.getElementById("btn-cek-laporan");
    const b = document.getElementById("filter-bulan").value;
    const t = document.getElementById("filter-tahun").value;

    if (!b || !t || parseInt(b) < 1 || parseInt(b) > 12) {
        showToast("Masukkan bulan (1-12) dan tahun yang valid.", "warning");
        return;
    }

    const restore = setButtonLoading(btn, "Mengambil...");
    try {
        const res = await Api.getLaporanBulanan(parseInt(b), parseInt(t));
        if (res.success) renderLaporan(res.data);
        else showToast(res.message || "Data tidak ditemukan.", "info");
    } catch (err) {
        showToast("Gagal: " + err.message, "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  BOOKING
// ─────────────────────────────────────────────

async function handleBooking(idBarang, btn) {
    // Booking uses a modal instead of prompt() for security & UX
    document.getElementById("booking-id-barang").value = idBarang;
    document.getElementById("booking-nama").value = "";
    document.getElementById("booking-tanggal").value = "";
    openModal("modal-booking");
}

async function handleKonfirmasiBooking() {
    const btn = document.getElementById("btn-konfirmasi-booking");
    const idBarang = document.getElementById("booking-id-barang").value;
    const nama = document.getElementById("booking-nama").value.trim();
    const tanggal = document.getElementById("booking-tanggal").value;

    if (!nama || nama.length < 2) { showToast("Nama pembooking minimal 2 karakter.", "warning"); return; }
    const { valid, errors } = validateTanggalBooking(tanggal);
    if (!valid) { showToast(errors.join(" "), "warning"); return; }

    const restore = setButtonLoading(btn, "Booking...");
    try {
        const res = await Api.postBooking(idBarang, nama, tanggal);
        showToast(res.message || "Booking berhasil!", "success");
        closeModal("modal-booking");
        loadKatalogReseller();
    } catch (err) {
        showToast("Gagal booking: " + err.message, "error");
    } finally {
        restore();
    }
}

async function handleProsesBayarBooking(id, btn) {
    // Use modal instead of prompt()
    document.getElementById("bayar-booking-id").value = id;
    document.getElementById("bayar-harga-input").value = "";
    openModal("modal-bayar-booking");
}

async function handleKonfirmasiBayar() {
    const btn = document.getElementById("btn-konfirmasi-bayar");
    const id = document.getElementById("bayar-booking-id").value;
    const harga = document.getElementById("bayar-harga-input").value;

    const { valid, errors } = validateHargaInput(harga);
    if (!valid) { showToast(errors.join(" "), "warning"); return; }

    const restore = setButtonLoading(btn, "Memproses...");
    try {
        const res = await Api.bayarBooking(id, harga);
        showToast(res.message || "Booking dilunasi!", "success");
        closeModal("modal-bayar-booking");
        loadDaftarBooking();
    } catch (err) {
        showToast("Gagal: " + err.message, "error");
    } finally {
        restore();
    }
}

async function handleCancelBooking(id, btn) {
    if (!confirm("Yakin cancel booking? Stok akan dikembalikan.")) return;
    const restore = setButtonLoading(btn, "Membatalkan...");
    try {
        const res = await Api.cancelBooking(id);
        showToast(res.message || "Booking dibatalkan.", "info");
        loadDaftarBooking();
    } catch (err) {
        showToast("Gagal: " + err.message, "error");
    } finally {
        restore();
    }
}

// ─────────────────────────────────────────────
//  EVENT DELEGATION — replaces all inline onclick
// ─────────────────────────────────────────────

function registerNavigationButtons() {
    document.querySelectorAll("[data-navigate]").forEach((btn) => {
        btn.addEventListener("click", () => navigate(btn.dataset.navigate));
    });
}

function registerNavSection() {
    // Owner login
    document.getElementById("btn-login")?.addEventListener("click", handleOwnerLogin);

    // Input barang
    document.getElementById("btn-simpan-barang")?.addEventListener("click", handleInputBarang);

    // Edit modal
    document.getElementById("btn-simpan-edit")?.addEventListener("click", handleSimpanPerubahan);
    document.getElementById("btn-batal-edit")?.addEventListener("click", () => closeModal("modal-edit"));

    // Lapor modal
    document.getElementById("btn-konfirmasi-lapor")?.addEventListener("click", handleEksekusiLapor);
    document.getElementById("btn-batal-lapor")?.addEventListener("click", () => closeModal("modal-lapor"));

    // Laporan filter
    document.getElementById("btn-cek-laporan")?.addEventListener("click", handleLaporanFilter);
    document.getElementById("btn-laporan-total")?.addEventListener("click", loadLaporanTotal);

    // Booking modal
    document.getElementById("btn-konfirmasi-booking")?.addEventListener("click", handleKonfirmasiBooking);
    document.getElementById("btn-batal-booking")?.addEventListener("click", () => closeModal("modal-booking"));

    // Bayar booking modal
    document.getElementById("btn-konfirmasi-bayar")?.addEventListener("click", handleKonfirmasiBayar);
    document.getElementById("btn-batal-bayar")?.addEventListener("click", () => closeModal("modal-bayar-booking"));
}

function registerCardDelegation() {
    // Owner catalog — edit button
    document.getElementById("owner-list-cards")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-edit-barang");
        if (!btn) return;
        openModalEdit(btn.dataset.id, btn.dataset.nama, btn.dataset.modal, btn.dataset.jual);
    });

    // Reseller catalog — lapor & booking buttons
    document.getElementById("reseller-list-cards")?.addEventListener("click", (e) => {
        const btnLapor = e.target.closest(".btn-lapor-terjual");
        const btnBook = e.target.closest(".btn-booking");

        if (btnLapor && !btnLapor.disabled) {
            openModalLapor(btnLapor.dataset.id, btnLapor.dataset.nama, btnLapor.dataset.harga);
        }
        if (btnBook && !btnBook.disabled) {
            handleBooking(btnBook.dataset.id, btnBook);
        }
    });

    // Riwayat — batalkan
    document.getElementById("riwayat-list-cards")?.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-batalkan-trx");
        if (btn) handleBatalkanTransaksi(btn.dataset.id, btn);
    });

    // Booking — lunas & cancel
    document.getElementById("booking-list-cards")?.addEventListener("click", (e) => {
        const btnLunas = e.target.closest(".btn-lunas");
        const btnCancel = e.target.closest(".btn-cancel-booking");
        if (btnLunas) handleProsesBayarBooking(btnLunas.dataset.id, btnLunas);
        if (btnCancel) handleCancelBooking(btnCancel.dataset.id, btnCancel);
    });
}

function registerSearchFilters() {
    const filters = [
        { inputId: "cari-barang-owner", container: "#owner-list-cards" },
        { inputId: "cari-barang", container: "#reseller-list-cards" },
        { inputId: "cari-transaksi", container: "#riwayat-list-cards" },
        { inputId: "cari-booking", container: "#booking-list-cards" },
    ];
    filters.forEach(({ inputId, container }) => {
        document.getElementById(inputId)?.addEventListener(
            "input",
            debounce((e) => filterCards(container, e.target.value), 250)
        );
    });
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────

export function init() {
    registerNavigationButtons();
    registerNavSection();
    registerCardDelegation();
    registerSearchFilters();

    // Boot screen
    navigate("main-menu");

    // PWA Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/sw.js")
            .then(() => console.info("[PWA] Service Worker registered."))
            .catch((err) => console.warn("[PWA] SW registration failed:", err));
    }
}
