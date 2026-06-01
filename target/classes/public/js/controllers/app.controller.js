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
    formatRupiah,
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
function toggleOwnerMenus(show = true){
    const ownerNavs = document.querySelectorAll(
        '[data-navigate="katalog-barang"], [data-navigate="laporan-keuangan-section"]'
    );
    ownerNavs.forEach(nav => {
        if(show){
            nav.classList.remove('hidden');
        }else{
            nav.classList.add('hidden');
        }
    });
}

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

// async function loadDashboardKeuangan() {
//     // 1. Cari container utama laporan keuangan
//     const section = document.getElementById("laporan-keuangan-section");
//     if (!section) return;
    
//     const displayArea = section.querySelector("laporan-display-area") || section;
    
//     // 2. AMANKAN STRUKTUR ASLI: Simpan layout HTML card bawaan index.html lo sebelum ditimpa spinner
//     const originalHTML = displayArea.innerHTML;
    
//     // 3. Jalankan spinner bawaan lo (destruktif, menimpa isi displayArea)
//     showSpinner(displayArea, "Menghitung kas tiga loket...");
    
//     try {
//         // Tembak API gabungan sakti via ngrok dev lo
//         const res = await Api.getDashboardKeuangan();
//         console.log("RESPONSE DARI API:", res);
        
//         if (res.success) {
//             // 4. RESTORE STRUKTUR: Kembalikan layout kotak-kotak card asli ke dalam DOM
//             // Teks "Menghitung kas..." otomatis hilang secara natural karena ketimpa layout asli
//             displayArea.innerHTML = originalHTML;

//             const data = res.data;
//             console.log("ISI DATA:", data);
//             const fmt = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(parseFloat(v) || 0);

//             // 5. Sekarang elemen ID ini dijamin lahir kembali di DOM, siap ditempel angka rupiah!
//             const modalEl = document.getElementById("display-modal-berputar");
//             const profitSaatIniEl = document.getElementById("display-profit-saat-ini");
//             const profitAllTimeEl = document.getElementById("display-profit-all-time");
//             const komisiSaatIniEl = document.getElementById("display-komisi-saat-ini");
//             const komisiAllTimeEl = document.getElementById("display-komisi-all-time");

//             if (modalEl) modalEl.textContent = fmt(data.danaBelanjaModal);
//             if (profitSaatIniEl) profitSaatIniEl.textContent = fmt(data.profitSaatIni);
//             if (profitAllTimeEl) profitAllTimeEl.textContent = fmt(data.profitAllTime);
//             if (komisiSaatIniEl) komisiSaatIniEl.textContent = fmt(data.komisiSaatIni);
//             if (komisiAllTimeEl) komisiAllTimeEl.textContent = fmt(data.komisiAllTime);
//         }
//     } catch (err) {
//         showToast("Gagal memuat dashboard keuangan: " + err.message, "error");
//         // Jika API gagal/error, kembalikan layout asli agar layar gak blank hitam atau stuck di spinner
//         displayArea.innerHTML = originalHTML;
//     }
//     // CATATAN: Blok finally sengaja gua hapus total. Gak ada lagi hideSpinner siluman yang bikin crash!
// }
async function loadDashboardKeuangan() {
    const displayArea = document.getElementById("laporan-display-area");
    if (!displayArea) return;

    try {
        const res = await Api.getDashboardKeuangan();
        if (!res || !res.success) return;

        const data = res.data;
        const fmt = (v) => formatRupiah(parseFloat(v) || 0);

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set("display-modal-berputar",  fmt(data.danaBelanjaModal));
        set("display-profit-saat-ini", fmt(data.profitSaatIni));
        set("display-profit-all-time", fmt(data.profitAllTime));
        set("display-komisi-saat-ini", fmt(data.komisiSaatIni));
        set("display-komisi-all-time", fmt(data.komisiAllTime));

    } catch (err) {
        showToast("Gagal memuat dashboard keuangan: " + err.message, "error");
    }
}

async function loadArusKasRiwayat() {
    // Cari container tempat tabel log mutasi arus kas nangkring
    const container = document.getElementById("arus-kas-riwayat-cards");
    if (!container) return;
    
    // Pakai skeleton loader bawaan biar transisi datanya mulus
    showSkeleton(container, 5);
    
    try {
        const res = await Api.getRiwayatMutasiKas();
        if (!res.success) throw new Error(res.message);
        
        // Tampilkan pesan kosong jika database belum ada log arus kas
        if (res.data.length === 0) {
            container.innerHTML = `<p class="text-center text-on-surface-variant font-mono text-xs py-8">Belum ada mutasi kas masuk/keluar.</p>`;
            return;
        }

        // Jika data ada, render menggunakan template card/table row baru lo nanti
        // Catatan: Pastikan nanti lo buat fungsi `templateCardArusKas` di templates.js
        if (typeof templateCardArusKas === "function") {
            container.innerHTML = res.data.map(templateCardArusKas).join("");
        } else {
            // Fallback render sederhana jika template fungsi belum lo buat
            container.innerHTML = res.data.map(item => `
                <div class="p-2 border-b border-outline font-mono text-xs flex justify-between">
                    <span>[${item.tipe_kas}] ${item.dompet} - ${item.keterangan}</span>
                    <span class="${item.tipe_kas === 'MASUK' ? 'text-tertiary' : 'text-error'}">
                        ${item.tipe_kas === 'MASUK' ? '+' : '-'} Rp ${parseFloat(item.jumlah).toLocaleString('id-ID')}
                    </span>
                </div>
            `).join("");
        }
    } catch (err) {
        container.innerHTML = `<p class="text-center text-error font-mono text-xs py-8">Gagal memuat log kas: ${err.message}</p>`;
    }
}
// ─────────────────────────────────────────────
//  SECTION NAVIGATION
// ─────────────────────────────────────────────

function navigate(sectionId) {
    //First Securty
    const ruanganOwner = [
        "owner-menu",
        "katalog-barang",
        "laporan-keuangan-section",
        "riwayat-transaksi-section"
    ];
    if (ruanganOwner.includes(sectionId) && !_isOwnerLoggedIn) {
        showToast("Akses ditolak!", "warning");
        sectionId = "main-menu";
    }
    //Second
    if (sectionId === "owner-login" && _isOwnerLoggedIn) {
        sectionId = "owner-menu";
    }
    showSection(sectionId);
    // Auto-refresh data on enter
    if (sectionId === "owner-menu" || sectionId === "katalog-barang") loadKatalogOwner();
    if (sectionId === "reseller-menu") loadKatalogReseller();
    if (sectionId === "booking-menu") loadDaftarBooking();
    if (sectionId === "riwayat-transaksi-section") {
        loadRiwayat();
        loadArusKasRiwayat(); 
    }
    
    // MODIFIKASI DI SINI: Ketika masuk ke keuangan, muat laporan total DAN dashboard tiga loket
    if (sectionId === "laporan-keuangan-section") {
        loadLaporanTotal();
        loadDashboardKeuangan(); 
    }
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
            // Idenifikasi Hidden 
            toggleOwnerMenus(true);
            document.getElementById("owner-menu")?.addEventListener("click", (e) => {
                const btnLogout = e.target.closest('[data-navigate="main-menu"]');
                if (btnLogout) {
                toggleOwnerMenus(false);
                _isOwnerLoggedIn = false;
                showToast("Logout Berhasil uji menu.", "info");
                }
            })
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
            ? "font-mono text-[22px] text-window-amber mt-1 fade-up"
            : roi >= 10
            ? "font-mono text-[22px] text-foliage-bright mt-1 fade-up"
            : "font-mono text-[22px] text-warning-red mt-1 fade-up";
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
//  RESET / PENCAIRAN KEUANGAN
// ─────────────────────────────────────────────

async function handleResetProfitOwner(btn) {
    if (!confirm("Yakin ingin mencairkan semua profit owner saat ini? Saldo berjalan akan di-reset ke Rp 0, namun rekor All-Time tetap aman.")) return;
    
    // Pasang loading state pada tombol agar aman dari spamming/double-click
    const restore = setButtonLoading(btn, "Memproses...");
    try {
        const res = await Api.resetProfitOwner();
        showToast(res.message || "Profit berhasil dicairkan!", "success");
        
        // Refresh data dashboard keuangan biar angka di card langsung update jadi Rp 0
        await loadDashboardKeuangan();
        // Refresh juga log mutasi kas karena ada baris KELUAR baru yang masuk
        await loadArusKasRiwayat();
    } catch (err) {
        showToast("Gagal mencairkan profit: " + err.message, "error");
    } finally {
        restore();
    }
}

async function handleResetKomisiReseller(btn) {
    if (!confirm("Yakin ingin mencairkan komisi reseller saat ini? Saldo berjalan akan di-reset ke Rp 0.")) return;
    
    const restore = setButtonLoading(btn, "Memproses...");
    try {
        const res = await Api.resetKomisiReseller();
        showToast(res.message || "Komisi reseller berhasil dicairkan!", "success");
        
        // Refresh data biar UI langsung sinkron dengan database
        await loadDashboardKeuangan();
        await loadArusKasRiwayat();
    } catch (err) {
        showToast("Gagal mencairkan komisi: " + err.message, "error");
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

    // Reset/Pencairan Uang
    document.getElementById("btn-reset-profit")?.addEventListener("click", (e) => handleResetProfitOwner(e.target));
    document.getElementById("btn-reset-komisi")?.addEventListener("click", (e) => handleResetKomisiReseller(e.target));
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

    // Riwayat — SUNTIKAN CLEAN CODE: Handle Batalkan TRX DAN Saklar Tabs Sekaligus
    document.getElementById("riwayat-transaksi-section")?.addEventListener("click", (e) => {
        // 1. Cek Tombol Batalkan Transaksi (Logic Lama Lo)
        const btnBatal = e.target.closest(".btn-batalkan-trx");
        if (btnBatal) {
            handleBatalkanTransaksi(btnBatal.dataset.id, btnBatal);
            return; // Exit early
        }

        // 2. Cek Tombol Tab Penjualan
        const isTabPenjualan = e.target.closest("#tab-btn-penjualan");
        if (isTabPenjualan) {
            switchRiwayatTab("penjualan");
            return;
        }

        // 3. Cek Tombol Tab Arus Kas
        const isTabArusKas = e.target.closest("#tab-btn-arus-kas");
        if (isTabArusKas) {
            switchRiwayatTab("arus-kas");
            return;
        }
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
// Helper private untuk transisi Tabs Riwayat & Arus Kas (Clean & Isolated)
function switchRiwayatTab(target) {
    const btnJual = document.getElementById("tab-btn-penjualan");
    const btnKas = document.getElementById("tab-btn-arus-kas");
    const kontenJual = document.getElementById("tab-konten-penjualan");
    const kontenKas = document.getElementById("tab-konten-arus-kas");

    if (!btnJual || !btnKas || !kontenJual || !kontenKas) return;

    if (target === "penjualan") {
        btnJual.className = "flex-1 text-center pb-3 tab-active transition-all focus:outline-none font-mono text-[10px] uppercase tracking-widest";
        btnKas.className  = "flex-1 text-center pb-3 border-b-2 border-transparent text-on-surface-dim transition-all focus:outline-none font-mono text-[10px] uppercase tracking-widest";
        kontenJual.classList.replace("hidden", "block");
        kontenKas.classList.replace("block", "hidden");
    } else {
        btnKas.className  = "flex-1 text-center pb-3 tab-active transition-all focus:outline-none font-mono text-[10px] uppercase tracking-widest";
        btnJual.className = "flex-1 text-center pb-3 border-b-2 border-transparent text-on-surface-dim transition-all focus:outline-none font-mono text-[10px] uppercase tracking-widest";
        kontenKas.classList.replace("hidden", "block");
        kontenJual.classList.replace("block", "hidden");
    }
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
