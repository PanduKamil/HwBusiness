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
    result.data.map(m => GudangUi.templateCardReseller(m)).join('');
}
// Riwayat Transaksi
async function muatRiwayat() {
    const result = await GudangApi.getRiwayat();
    const container = document.getElementById('riwayat-list-cards');
        if (!container || !result.success) return;

        container.innerHTML = result.data.length === 0 ? "<p>Belum ada transaksi</p>" :
        result.data.map(t => GudangUi.templateCardRiwayat(t)).join('');
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
        container.innerHTML = `<p style="text-align:center;">Tidak ada booking aktif</p>`;
    }
}



// 3  
window.showSection = (idTerpilih) => {
    GudangUi.showSection(idTerpilih);
    
    // Auto-refresh data sesuai section yang dibuka
    if (['owner-menu', 'owner-katalog'].includes(idTerpilih)) muatKatalog();
    if (idTerpilih === 'reseller-menu') muatKatalogReseller();
    if (idTerpilih === 'riwayat-transaksi-section') muatRiwayat();
    if (idTerpilih === 'booking-menu') muatDaftarBooking();
};
// Pembatalan Transaksi
window.batalkanTransaksi = async (id) => {
    try {
        if(!confirm("Batalin?")) return;
    const res = await GudangApi.deleteTransaksi(id);
    if(res.success) { alert(res.message);
        console.log("Transaksi berhasil");
         muatRiwayat(); }
    } catch (error) {
         alert("Error: " + error.message);
    }
};
// Eksekusi Transaksi
window.eksekusiLaporPenjualan = async () => {
    try {
        const id = document.getElementById('lapor-id').value;
        const hargaLaku = parseFloat(document.getElementById('lapor-harga-input').value);
        const res = await GudangApi.postPenjualan(id, hargaLaku);
            if (res.success) {
                alert(res.message);
                tutupModalLapor();
                muatKatalogReseller();

        }
    } catch (error) {
        alert("Error: " + error.message);
    }
    
};
// Filter Laporan
window.handleLaporanFilter = async () => {
    const b = document.getElementById('filter-bulan').value;
    const t = document.getElementById('filter-tahun').value;
    const res = await GudangApi.getLaporanBulanan(b, t);
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
    const response = await GudangApi.postBarangBaru(data);

    alert(response);

        document.getElementById('namaBarang').value = "";
        document.getElementById('hargaModal').value = "";
        document.getElementById('hargaJual').value = "";
        document.getElementById('stok').value = "";

        showSection('owner-menu');
};
window.laporPenjualan = async (id, nama, hargaSaran) => {
    try {
        GudangUi.isiModalLapor(id, nama, hargaSaran);
        console.log("Laporan berhasil");
    } catch (error) {
        alert("Error: Gagal Lapor" + error.message);
    }
};
window.simpanPerubahanBarang = async () => {
    const id = document.getElementById('edit-id').value;
    const data = {
        nama: document.getElementById('edit-nama').value,
        hargaModal: parseFloat(document.getElementById('edit-modal').value),
        hargaPerkiraanJual: parseFloat(document.getElementById('edit-jual').value)
    };
    const response = await GudangApi.saveBarang(id, data);
    if (response.success) {
            alert("Data berhasil diupdate!");
            tutupModalEdit();
            muatKatalog('tabel-owner'); // Refresh tabel
        } else {
            alert("Gagal update data!");
        }
}
// POP UP
window.bukaModalEdit = (id, nama, modal, jual) => {
    GudangUi.toggleModal({id, nama, modal, jual});
};
window.tutupModalEdit = () => {
    document.getElementById('modal-edit').style.display = 'none';
}

window.tutupModalLapor = () => {
    document.getElementById('modal-lapor').style.display = 'none';
};
window.handleBooking = async (idBarang, btn) => {
    if (btn && btn.disabled) return;
    if(btn) btn.disabled = true;
    try {
        const nama = prompt("Nama Pembooking:");
        const tanggal = prompt("Janji bayar (YYYY-MM-DD):", "2026-04-30");
        
        if (!nama || !tanggal) return;

        const resp = await GudangApi.postBooking(idBarang, nama, tanggal);
        alert(resp.message);
        if(resp.success) muatKatalogReseller();
    } catch (error) {
        console.error(error);
    }finally{
        if(btn) btn.disabled = false;
    }
}
window.prosesBayarBooking = async (id) => {
    try {
        const harga = prompt("Masukkan Harga Jual Final:");
    if (!harga || isNaN(harga)) return;

    const resp = await GudangApi.bayarBooking(id, harga);
        alert(resp.message);
    if (resp.success) muatDaftarBooking();

    } catch (error) {
        alert("Error: " + error.message);
    }
};

window.handleCancelBooking = async (id) => {
    if(!confirm("Yakin mau cancel booking ini?")) return;
    const resp = await GudangApi.cancelBooking(id);
    alert(resp.message);
    console.log("nah kok cancel");
    if(resp.success) muatDaftarBooking();
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