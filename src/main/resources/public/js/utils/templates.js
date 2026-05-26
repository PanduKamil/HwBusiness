/**
 * @file templates.js
 * @description Pure functions that return sanitized HTML strings for each card type.
 * All user-supplied string values are passed through sanitizeText() before injection
 * to prevent XSS. Numeric event data is passed via data attributes, never inline JS args.
 */

import { sanitizeText, formatRupiah } from "../utils/sanitize.utils.js";

/**
 * Card for Owner's inventory catalog.
 * @param {{ id: number, nama: string, stok: number, hargaModal: string|number, hargaPerkiraanJual: string|number }} item
 * @returns {string} HTML string
 */
export function templateCardOwner(item) {
    const id = Number(item.id);
    const nama = sanitizeText(item.nama);
    const stok = Number(item.stok);
    const stokClass = stok <= 0 ? "text-error" : "text-tertiary";

    return `
    <div class="glass-card rounded-lg p-5 flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300" data-card data-item-id="${id}">
        <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
                <p class="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">ID: ${id}</p>
                <h4 class="font-headline text-sm uppercase tracking-wide text-primary truncate" data-card-name>${nama}</h4>
            </div>
            <span class="font-mono text-xs ${stokClass} shrink-0 ml-3 bg-surface-container-high px-2 py-1 rounded">
                Stok: ${stok}
            </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <div class="bg-surface-container-high rounded px-3 py-2">
                <p class="text-on-surface-variant text-[10px] uppercase mb-1">Modal</p>
                <p class="text-on-surface">${formatRupiah(item.hargaModal)}</p>
            </div>
            <div class="bg-surface-container-high rounded px-3 py-2">
                <p class="text-on-surface-variant text-[10px] uppercase mb-1">Estimasi Jual</p>
                <p class="text-secondary">${formatRupiah(item.hargaPerkiraanJual)}</p>
            </div>
        </div>
        <button
            class="btn-edit-barang w-full py-2.5 rounded-md border border-primary/40 text-primary font-headline text-xs uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all"
            data-id="${id}"
            data-nama="${nama}"
            data-modal="${item.hargaModal}"
            data-jual="${item.hargaPerkiraanJual}">
            <span class="material-symbols-outlined text-sm align-middle mr-1">edit</span>Edit
        </button>
    </div>`;
}

/**
 * Card for Reseller's catalog view.
 * @param {{ id: number, nama: string, stok: number, hargaPerkiraanJual: string|number }} item
 * @returns {string} HTML string
 */
export function templateCardReseller(item) {
    const id = Number(item.id);
    const nama = sanitizeText(item.nama);
    const stok = Number(item.stok);
    const habis = stok <= 0;

    return `
    <div class="glass-card rounded-lg p-5 flex flex-col gap-4 ${habis ? "opacity-50" : "group hover:border-primary/30"} transition-all duration-300" data-card data-item-id="${id}">
        <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
                <h4 class="font-headline text-sm uppercase tracking-wide text-primary truncate" data-card-name>${nama}</h4>
                <p class="font-mono text-secondary text-sm mt-1">${formatRupiah(item.hargaPerkiraanJual)}</p>
            </div>
            <span class="font-mono text-xs shrink-0 ml-3 px-2 py-1 rounded ${habis ? "bg-error/10 text-error" : "bg-tertiary/10 text-tertiary"}">
                ${habis ? "HABIS" : `Stok: ${stok}`}
            </span>
        </div>
        <div class="flex gap-2">
            <button
                class="btn-lapor-terjual flex-[2] py-2.5 rounded-md font-headline text-xs uppercase tracking-widest transition-all active:scale-95
                    ${habis ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed" : "bg-gradient-to-r from-primary to-primary-dim text-on-primary shadow-[0_2px_10px_rgba(160,32,240,0.3)] hover:shadow-[0_2px_20px_rgba(160,32,240,0.5)]"}"
                data-id="${id}"
                data-nama="${nama}"
                data-harga="${item.hargaPerkiraanJual}"
                ${habis ? "disabled" : ""}>
                ${habis ? "Stok Habis" : "Lapor Terjual"}
            </button>
            <button
                class="btn-booking flex-1 py-2.5 rounded-md border border-secondary text-secondary font-headline text-xs uppercase tracking-widest hover:bg-secondary/10 active:scale-95 transition-all"
                data-id="${id}"
                ${habis ? "disabled" : ""}>
                <span class="material-symbols-outlined text-sm align-middle">bookmark_add</span>
            </button>
        </div>
    </div>`;
}

/**
 * Card for transaction history.
 * @param {{ id: number, namaBarang: string, tanggal: string, hargaLaku: string|number }} trx
 * @returns {string} HTML string
 */
export function templateCardRiwayat(trx) {
    const id = Number(trx.id);
    const nama = sanitizeText(trx.namaBarang);
    const tanggal = sanitizeText(trx.tanggal);

    return `
    <div class="bg-surface-container rounded-lg border-l-4 border-yellow-400/80 p-5 flex flex-col gap-3 hover:bg-surface-container-high transition-colors" data-card data-item-id="${id}">
        <div class="flex justify-between items-center">
            <span class="font-mono text-[10px] text-on-surface-variant uppercase">TRX #${id}</span>
            <span class="font-mono text-[10px] text-on-surface-variant">${tanggal}</span>
        </div>
        <div>
            <h4 class="font-headline text-sm text-on-surface uppercase tracking-wide" data-card-name>${nama}</h4>
            <p class="font-mono text-secondary text-sm mt-1">${formatRupiah(trx.hargaLaku)}</p>
        </div>
        <button
            class="btn-batalkan-trx w-full py-2 rounded-md border border-error/50 text-error font-headline text-xs uppercase tracking-widest hover:bg-error/10 active:scale-95 transition-all"
            data-id="${id}">
            <span class="material-symbols-outlined text-sm align-middle mr-1">delete</span>Batalkan
        </button>
    </div>`;
}

/**
 * Card for active booking list.
 * @param {{ id: number, namaBarang: string, namaPembooking: string, jumlah: number, batasPembayaranStr: string }} bk
 * @returns {string} HTML string
 */
export function templateCardBooking(bk) {
    const id = Number(bk.id);
    const namaBarang = sanitizeText(bk.namaBarang);
    const namaPembooking = sanitizeText(bk.namaPembooking);
    const deadline = sanitizeText(bk.batasPembayaranStr);

    return `
    <div class="bg-surface-container rounded-lg border-l-4 border-secondary/70 p-5 flex flex-col gap-4" data-card data-item-id="${id}">
        <div class="flex justify-between items-start">
            <div>
                <p class="font-mono text-[10px] text-on-surface-variant uppercase">Booking #${id}</p>
                <h4 class="font-headline text-sm text-secondary uppercase mt-1" data-card-name>${namaBarang}</h4>
            </div>
            <span class="font-mono text-[10px] text-error bg-error/10 px-2 py-1 rounded shrink-0">
                ${deadline}
            </span>
        </div>
        <div class="font-mono text-xs text-on-surface-variant grid grid-cols-2 gap-1">
            <span>Pembooking:</span><span class="text-on-surface font-bold">${namaPembooking}</span>
            <span>Jumlah:</span><span class="text-on-surface">${Number(bk.jumlah)} pcs</span>
        </div>
        <div class="flex gap-2">
            <button
                class="btn-lunas flex-[2] py-2.5 rounded-md bg-gradient-to-r from-tertiary/80 to-tertiary text-black font-headline text-xs uppercase tracking-widest active:scale-95 transition-all"
                data-id="${id}">
                <span class="material-symbols-outlined text-sm align-middle mr-1">payments</span>Lunas
            </button>
            <button
                class="btn-cancel-booking flex-1 py-2.5 rounded-md border border-error/50 text-error font-headline text-xs uppercase tracking-widest hover:bg-error/10 active:scale-95 transition-all"
                data-id="${id}">
                <span class="material-symbols-outlined text-sm align-middle">close</span>
            </button>
        </div>
    </div>`;
}
