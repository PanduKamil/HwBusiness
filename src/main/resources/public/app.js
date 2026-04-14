// 1
import { GudangApi } from "./api.js";
import { GudangUi } from "./ui.js";

// 2
// Katalog  Owner
async function muatKatalog() {
    const res = await GudangApi.getBarang();
    const container = document.getElementById('owner-list-cards');
        if (!container || !res.success) return;

    container.innerHTML = res.data.length === 0 ? "<p>Gudang Kosong</p>" : 
    res.data.map(m => GudangUi.templateCardOwner(m)).join('');
}
// Katalog User/Reseller
async function muatKatalogReseller() {
    const result = await GudangApi.getBarang();
    const container = document.getElementById('reseller-list-cards');
        if (!container || !result.success) return;

    container.innerHTML = result.data.length === 0 ? "<p>Gudang Kosong</p>" : 
    res.data.map(m => GudangUi.templateCardReseller(m)).join('');
}
// Riwayat Transaksi
async function muatRiwayat() {
    const result = await GudangApi.getRiwayat();
    const container = document.getElementById('riwayat-list-cards');
        if (!container || !result.success) return;

        container.innerHTML = result.data.length === 0 ? "<p>Belum ada transaksi</p>" :
        res.data.map(t => GudangUi.templateCardRiwayat(t)).join('');
}
// Laporan Transaksi
async function muatLaporanTotal() {
    const res = await GudangApi.getLaporanTotal();
    if(res.success) GudangUi.updateTampilanLaporan(res.data);
}
// Booking
async function muatDaftarBooking() {
    const res = await GudangApi.getBookingList();
    const container = document.getElementById('booking-list-cards');
    if(!container) return;

    if(res.success && res.data.length > 0) {
        container.innerHTML = res.data.map(bk => GudangUi.templateCardBooking(bk)).join('');
    } else {
        container.innerHTML = <p style="text-align:center;">Tidak ada booking aktif</p>;
    }
}



// 3  
window.showSection = (idTerpilih) => {
    GudangUi.showSection(idTerpilih);
    
    // Auto-refresh data sesuai section yang dibuka
    if (['owner-menu', 'owner-katalog'].includes(idTerpilih)) muatKatalog();
    if (idTerpilih === 'reseller-menu') muatKatalogReseller();
    if (idTerpilih === 'owner-riwayat') muatRiwayat();
    if (idTerpilih === 'booking-menu') muatDaftarBooking();
};
// Pembatalan Transaksi
window.batalkanTransaksi = async (id) => {
    if(!confirm("Batalin?")) return;
    const res = await GudangApi.deleteTransaksi();
    if(res.success) { alert(res.message); muatRiwayat(); }
};
// Eksekusi Transaksi
window.eksekusiLaporPenjualan = async () => {
    const id = document.getElementById('lapor-id').value;
    const hargaLaku = parseFloat(document.getElementById('lapor-harga-input').value);
    const res = await GudangApi.postPenjualan();
        if (res.success) {
            alert(res.message);
            tutupModalLapor();
            muatKatalogReseller();
        }
};
// Filter Laporan
window.handleLaporanFilter = async () => {
    const b = document.getElementById('filter-bulan').value;
    const t = document.getElementById('filter-tahun').value;
    const res = await GudangApi.getLaporanBulanan();
    if(res.success) GudangUi.updateTampilanLaporan(res.data);
};
// Login Owner
window.handleOwnerLogin = async () => {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('password').value;
    const response = await GudangApi.login(userIn, passIn);

        if (response.ok) {
            alert("Login berhasil");
            showSection('owner-menu');
        } else {
            alert("Gagal: Username atau Password salah!");
        }
};
window.handleInputBarang = async () => {
    const data = {
        nama: document.getElementById('namaBarang').value,
        hargaModal: parseFloat(document.getElementById('hargaModal').value),
        hargaPerkiraanJual: parseFloat(document.getElementById('hargaJual').value),
        stok: parseInt(document.getElementById('stok').value)
    };
    const response = await GudangApi.postBarangBaru();
    alert(text);

        document.getElementById('namaBarang').value = "";
        document.getElementById('hargaModal').value = "";
        document.getElementById('hargaJual').value = "";
        document.getElementById('stok').value = "";

        showSection('owner-menu');
};
window.laporPenjualan = async (id, nama, hargaSaran) => {
    GudangUi.isiModalLapor(id, nama, hargaSaran);
};
window.simpanPerubahanBarang = async () => {
    const id = document.getElementById('edit-id').value;
    const data = {
        nama: document.getElementById('edit-nama').value,
        hargaModal: parseFloat(document.getElementById('edit-modal').value),
        hargaPerkiraanJual: parseFloat(document.getElementById('edit-jual').value)
    };

    const response = await GudangApi.saveBarang();
    if (response.ok) {
            alert("Data berhasil diupdate!");
            tutupModalEdit();
            muatKatalog('tabel-owner'); // Refresh tabel
        } else {
            alert("Gagal update data!");
        }
}
window.bukaModalEdit = async (id, nama, modal, jual) => {
    GudangUi.toggleModal('modal-edit', 'open', {id, nama, modal, jual});
};
window.tutupModalLapor = async() => {tutupModalEdit
    GudangUi.toggleModal('modal-edit', 'close');
};
window.handleBooking = async () => {
    const nama = prompt("Nama Pembooking:");
    const tanggal = prompt("Janji bayar (YYYY-MM-DD):", "2026-04-30");
    
    if (!nama || !tanggal) return;

    const resp = await GudangApi.postBooking({idBarang, nama, jumlah: 1, tanggal});

    const res = await resp.json();
    alert(res.message);
    if(res.success) location.reload();
}
window.prosesBayarBooking = async (id) => {
    const harga = prompt("Masukkan Harga Jual Final:");
    if (!harga || isNaN(harga)) return;

    const resp = await GudangApi.bayarBooking(id, harga);
    const res = await resp.json();
    alert(res.message);
    if (res.success) muatDaftarBooking();
};

window.handleCancelBooking = async (id) => {
    if(!confirm("Yakin mau cancel booking ini?")) return;
    const resp = await GudangApi.cancelBooking(id);
    const res = await resp.json();
    alert(res.message);
    if(res.success) muatDaftarBooking();
};

// Filterisasi wwkwkwk
window.filterBarangOwner = async () => {
    const kataKunci = document.getElementById('cari-barang-owner').value.toLowerCase();
    GudangUi.filterBarang('#owner-list-cards', kataKunci);
};
window.filterBarangReseller = async () => {
    const input = document.getElementById('cari-barang').value.toLowerCase();
    GudangUi.filterBarang('#reseller-list-cards', input);
};
window.filterRiwayat = async () => {
    const input = document.getElementById('cari-transaksi').value.toLowerCase();
    GudangUi.filterBarang('#riwayat-list-cards', input);
};
window.filterBooking = async () => {
    const keyword = document.getElementById('cari-booking').value.toLowerCase();
    GudangUi.filterBarang('#booking-list-cards', keyword);
};
window.exitApp = () => {
    if(confirm("Yakin mau keluar?")) {
        alert("Aplikasi Berhenti.");
        window.close();
    }
};

// 4 Auto Run
muatKatalog();
muatKatalogReseller();
muatRiwayat();
muatLaporanTotal();
muatDaftarBooking();

showSection('main-menu');