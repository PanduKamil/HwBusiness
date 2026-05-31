/**
 * @file templates.js
 * @description Pure functions that return sanitized HTML strings for each card type.
 * Design system: Pixel/retro terminal aesthetic — sharp corners, IBM Plex Mono,
 * px-card / px-btn component language matching index-2.html.
 *
 * All user-supplied string values are passed through sanitizeText() before injection
 * to prevent XSS. Numeric event data is passed via data attributes, never inline JS args.
 */

import { sanitizeText, formatRupiah } from "../utils/sanitize.utils.js";

/**
 * Card for Owner's inventory catalog.
 * Accent color: window-amber (#F5C87A)
 *
 * @param {{ id: number, nama: string, stok: number, hargaModal: string|number, hargaPerkiraanJual: string|number }} item
 * @returns {string} HTML string
 */
export function templateCardOwner(item) {
    const id = Number(item.id);
    const nama = sanitizeText(item.nama);
    const stok = Number(item.stok);
    const stokEmpty = stok <= 0;

    return `
    <div class="px-card px-card-amber flex flex-col gap-4 p-5" data-card data-item-id="${id}">

        <!-- Header row -->
        <div class="flex justify-between items-start gap-3">
            <div class="flex-1 min-w-0">
                <span class="font-mono text-[9px] tracking-widest uppercase" style="color:#3B7EA6;">// ID: ${id}</span>
                <h4 class="font-mono font-semibold text-[12px] uppercase tracking-wide mt-1 truncate" style="color:#F5C87A;" data-card-name>${nama}</h4>
            </div>
            <span class="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border shrink-0
                ${stokEmpty
                    ? "border-[#E05A4E] text-[#E05A4E] bg-[rgba(224,90,78,0.08)]"
                    : "border-[#4AE060] text-[#4AE060] bg-[rgba(74,224,96,0.07)]"}">
                ${stokEmpty ? "STOK 0" : `STK: ${stok}`}
            </span>
        </div>

        <!-- Price grid -->
        <div class="grid grid-cols-2 gap-2">
            <div style="background:#0A1628; border:1px solid #1E3A5F;" class="px-3 py-2">
                <p class="font-mono text-[9px] uppercase tracking-widest" style="color:#3B7EA6;">Modal</p>
                <p class="font-mono text-[12px] mt-1" style="color:#e4e2e5;">${formatRupiah(item.hargaModal)}</p>
            </div>
            <div style="background:#0A1628; border:1px solid #1E3A5F;" class="px-3 py-2">
                <p class="font-mono text-[9px] uppercase tracking-widest" style="color:#3B7EA6;">Est. Jual</p>
                <p class="font-mono text-[12px] mt-1" style="color:#4AE060;">${formatRupiah(item.hargaPerkiraanJual)}</p>
            </div>
        </div>

        <!-- Action button -->
        <button
            class="px-btn px-btn-amber w-full py-3"
            data-id="${id}"
            data-nama="${nama}"
            data-modal="${item.hargaModal}"
            data-jual="${item.hargaPerkiraanJual}">
            <span class="material-symbols-outlined" style="font-size:14px;">edit</span>
            Edit Barang
        </button>

    </div>`;
}

/**
 * Card for Reseller's catalog view.
 * Accent color: window-cool (#A8D4F0) for available, warning-red for sold-out.
 *
 * @param {{ id: number, nama: string, stok: number, hargaPerkiraanJual: string|number }} item
 * @returns {string} HTML string
 */
export function templateCardReseller(item) {
    const id = Number(item.id);
    const nama = sanitizeText(item.nama);
    const stok = Number(item.stok);
    const habis = stok <= 0;

    return `
    <div class="px-card ${habis ? "px-card-red opacity-60" : "px-card-blue"} flex flex-col gap-4 p-5"
         data-card data-item-id="${id}">

        <!-- Header row -->
        <div class="flex justify-between items-start gap-3">
            <div class="flex-1 min-w-0">
                <h4 class="font-mono font-semibold text-[12px] uppercase tracking-wide truncate"
                    style="color:${habis ? "#E05A4E" : "#A8D4F0"};"
                    data-card-name>${nama}</h4>
                <p class="font-mono text-[13px] mt-1" style="color:#4AE060;">${formatRupiah(item.hargaPerkiraanJual)}</p>
            </div>
            <span class="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border shrink-0
                ${habis
                    ? "border-[#E05A4E] text-[#E05A4E] bg-[rgba(224,90,78,0.08)]"
                    : "border-[#A8D4F0] text-[#A8D4F0] bg-[rgba(168,212,240,0.07)]"}">
                ${habis ? "HABIS" : `STK: ${stok}`}
            </span>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
            <button
                class="px-btn flex-[2] py-3 ${habis ? "px-btn-ghost cursor-not-allowed" : "px-btn-green"}"
                data-id="${id}"
                data-nama="${nama}"
                data-harga="${item.hargaPerkiraanJual}"
                ${habis ? "disabled" : ""}>
                ${habis
                    ? `<span class="material-symbols-outlined" style="font-size:14px;">block</span> Stok Habis`
                    : `<span class="material-symbols-outlined" style="font-size:14px;">check_circle</span> Lapor Terjual`}
            </button>
            <button
                class="px-btn px-btn-blue flex-1 py-3"
                data-id="${id}"
                ${habis ? "disabled" : ""}>
                <span class="material-symbols-outlined" style="font-size:14px;">bookmark_add</span>
            </button>
        </div>

    </div>`;
}

/**
 * Card for transaction history.
 * Accent color: window-amber left border — archive/log feel.
 *
 * @param {{ id: number, namaBarang: string, tanggal: string, hargaLaku: string|number }} trx
 * @returns {string} HTML string
 */
export function templateCardRiwayat(trx) {
    const id = Number(trx.id);
    const nama = sanitizeText(trx.namaBarang);
    const tanggal = sanitizeText(trx.tanggal);

    return `
    <div class="px-card flex flex-col gap-3 p-5"
         style="border-left:3px solid #F5C87A;"
         data-card data-item-id="${id}">

        <!-- Meta row -->
        <div class="flex justify-between items-center">
            <span class="font-mono text-[9px] uppercase tracking-widest" style="color:#3B7EA6;">TRX #${id}</span>
            <span class="font-mono text-[9px] uppercase tracking-widest" style="color:#8a8d96;">${tanggal}</span>
        </div>

        <!-- Item info -->
        <div>
            <h4 class="font-mono font-semibold text-[12px] uppercase tracking-wide"
                style="color:#e4e2e5;"
                data-card-name>${nama}</h4>
            <p class="font-mono text-[13px] mt-1" style="color:#4AE060;">${formatRupiah(trx.hargaLaku)}</p>
        </div>

        <!-- Cancel button -->
        <button
            class="px-btn px-btn-red w-full py-2.5"
            data-id="${id}">
            <span class="material-symbols-outlined" style="font-size:14px;">delete</span>
            Batalkan
        </button>

    </div>`;
}

/**
 * Card for active booking list.
 * Accent color: foliage-bright (#4AE060) — active/pending status.
 *
 * @param {{ id: number, namaBarang: string, namaPembooking: string, jumlah: number, batasPembayaranStr: string }} bk
 * @returns {string} HTML string
 */
export function templateCardBooking(bk) {
    const id = Number(bk.id);
    const namaBarang = sanitizeText(bk.namaBarang);
    const namaPembooking = sanitizeText(bk.namaPembooking);
    const deadline = sanitizeText(bk.batasPembayaranStr);

    return `
    <div class="px-card px-card-green flex flex-col gap-4 p-5" data-card data-item-id="${id}">

        <!-- Header row -->
        <div class="flex justify-between items-start gap-3">
            <div>
                <span class="font-mono text-[9px] uppercase tracking-widest" style="color:#3B7EA6;">// BKG #${id}</span>
                <h4 class="font-mono font-semibold text-[12px] uppercase tracking-wide mt-1"
                    style="color:#4AE060;"
                    data-card-name>${namaBarang}</h4>
            </div>
            <span class="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border border-[#E05A4E] text-[#E05A4E] bg-[rgba(224,90,78,0.08)] shrink-0">
                ${deadline}
            </span>
        </div>

        <!-- Detail grid -->
        <div style="background:#0A1628; border:1px solid #1E3A5F;" class="px-3 py-3 grid grid-cols-2 gap-y-2">
            <span class="font-mono text-[10px] uppercase tracking-wide" style="color:#8a8d96;">Pembooking</span>
            <span class="font-mono text-[10px] font-semibold uppercase" style="color:#e4e2e5;">${namaPembooking}</span>
            <span class="font-mono text-[10px] uppercase tracking-wide" style="color:#8a8d96;">Jumlah</span>
            <span class="font-mono text-[10px]" style="color:#e4e2e5;">${Number(bk.jumlah)} pcs</span>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2">
            <button
                class="px-btn px-btn-green flex-[2] py-3"
                data-id="${id}">
                <span class="material-symbols-outlined" style="font-size:14px;">payments</span>
                Lunas
            </button>
            <button
                class="px-btn px-btn-red flex-1 py-3"
                data-id="${id}">
                <span class="material-symbols-outlined" style="font-size:14px;">close</span>
            </button>
        </div>

    </div>`;
}
