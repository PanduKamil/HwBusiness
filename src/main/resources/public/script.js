
const API_URL = "https://specimen-recliner-credible.ngrok-free.dev";

// 1. Fungsi Navigasi & Reset
function showSection(idTerpilih) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const el = document.getElementById(idTerpilih);
    if (el) el.style.display = 'block';

    if (idTerpilih === 'owner-menu' || idTerpilih === 'owner-katalog') muatKatalog();
    if (idTerpilih === 'reseller-menu') muatKatalogReseller();
    if (idTerpilih === 'owner-riwayat') muatRiwayat();
    if (idTerpilih === 'booking-menu') muatDaftarBooking();
}

// ---- Katalog
async function muatKatalog() {
    try {
        const response = await fetch(`${API_URL}/api/barang`);
        const result = await response.json();
        const container = document.getElementById('owner-list-cards');
        if (!container || !result.success) return;

        container.innerHTML = result.data.length === 0 ? "<p>Gudang Kosong</p>" : "";
        result.data.forEach(m => {
            container.innerHTML += 
                `<div class="report-card" style="border-left: 5px solid #00ccff;">
                    <div class="report-header"><span>ID: ${m.id}</span><span>Stok: ${m.stok}</span></div>
                    <div class="report-body">
                        <h4>${m.nama}</h4>
                        <p>Modal: Rp ${m.hargaModal.toLocaleString()}</p>
                        <p>Jual: Rp ${m.hargaPerkiraanJual.toLocaleString()}</p>
                    </div>
                    <button onclick="bukaModalEdit(${m.id}, '${m.nama}', ${m.hargaModal}, ${m.hargaPerkiraanJual})">EDIT</button>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function muatKatalogReseller() {
    try {
        const response = await fetch(`${API_URL}/api/barang`);
        const result = await response.json();
        const container = document.getElementById('reseller-list-cards');
        if (!container || !result.success) return;

        container.innerHTML = result.data.length === 0 ? "<p>Gudang Kosong</p>" : "";
        result.data.forEach(m => {
            container.innerHTML += 
                `<div class="report-card">
                    <div class="report-header"><span>ID: ${m.id}</span><span class="${m.stok <= 0 ? 'empty' : ''}">Stok: ${m.stok}</span></div>
                    <div class="report-body"><h4>${m.nama}</h4><p>Harga: Rp ${m.hargaPerkiraanJual.toLocaleString()}</p></div>
                    <button onclick="laporPenjualan(${m.id}, '${m.nama}', ${m.hargaPerkiraanJual})" ${m.stok <= 0 ? 'disabled' : ''}>
                        ${m.stok <= 0 ? 'STOK HABIS' : 'LAPOR TERJUAL'}
                    </button>
                    <button onclick="handleBooking(${m.id})" style="background-color: #ff00ff;" ${m.stok <= 0 ? 'disabled' : ''}>
                    BOOK
                </button>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

// ------ Transaksi & Riwayat
async function eksekusiLaporPenjualan() {
    const id = document.getElementById('lapor-id').value;
    const hargaLaku = parseFloat(document.getElementById('lapor-harga-input').value);

    try {
        const response = await fetch(`${API_URL}/api/transaksi/jual/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku: hargaLaku })
        });
        const res = await response.json();
        if (res.success) {
            alert(res.message);
            tutupModalLapor();
            muatKatalogReseller();
        }
    } catch (e) { alert("Server Error"); }
}

async function muatRiwayat() {
    try {
        const response = await fetch(`${API_URL}/api/transaksi`);
        const result = await response.json();
        const container = document.getElementById('riwayat-list-cards');
        if (!container || !result.success) return;

        container.innerHTML = result.data.length === 0 ? "<p>Belum ada transaksi</p>" : "";
        result.data.forEach(t => {container.innerHTML += 
                `<div class="report-card" style="border-left: 5px solid #ffcc00;">
                    <div class="report-header"><span>Trx: ${t.id}</span><span>${t.tanggal}</span></div>
                    <div class="report-body"><h4>${t.namaBarang}</h4><p>Laku: Rp ${t.hargaLaku.toLocaleString()}</p></div>
                    <button onclick="batalkanTransaksi(${t.id})" style="color:red; border-color:red;">BATALKAN</button>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function batalkanTransaksi(id) {
    if(!confirm("Batalin?")) return;
    const resp = await fetch(`${API_URL}/api/transaksi/${id}`, { method: 'DELETE' });
    const res = await resp.json();
    if(res.success) { alert(res.message); muatRiwayat(); }
}


// 4. Laporan
async function muatLaporanTotal() {
    const resp = await fetch(`${API_URL}/api/laporan/total`);
    const res = await resp.json();
    if(res.success) updateTampilanLaporan(res.data);
}

async function handleLaporanFilter() {
    const b = document.getElementById('filter-bulan').value;
    const t = document.getElementById('filter-tahun').value;
    const resp = await fetch(`${API_URL}/api/laporan/bulanan/${b}/${t}`);
    const res = await resp.json();
    if(res.success) updateTampilanLaporan(res.data);
}

function updateTampilanLaporan(data) {
    document.getElementById('display-omset').innerText = "Rp " + data.omset.toLocaleString();
    document.getElementById('display-komisi').innerText = "Rp " + data.komisi.toLocaleString();
    document.getElementById('display-profit').innerText = "Rp " + data.profit.toLocaleString();
    document.getElementById('display-modal').innerText = "Rp " + data.modal.toLocaleString();
    document.getElementById('display-periode').innerText = data.periode;

    // Logika ROI
    const profit = parseFloat(data.profit);
    const modal = parseFloat(data.modal);
    let roi = 0;

    if (modal > 0) {
        roi = (profit / modal) * 100;
    }

    // Update tampilan ROI
    const roiElement = document.getElementById('display-roi');
    roiElement.innerText = roi.toFixed(2) + "%";
     if (roi > 20) {
        roiElement.style.color = "#39FF14"; // Hijau Neon (Sehat Banget)
        roiElement.style.textShadow = "0 0 10px #39FF14"; // Efek Glow
    } else if (roi >= 10 && roi <= 20) {
        roiElement.style.color = "#FFD700"; // Kuning/Gold (Normal)
        roiElement.style.textShadow = "0 0 10px #FFD700";
    } else {
        roiElement.style.color = "#FF3131"; // Merah Neon (Tipis/Evaluasi)
        roiElement.style.textShadow = "0 0 10px #FF3131";
    }
}

// Fungsi Filter khusus Owner
function filterBarangOwner() {
    const input = document.getElementById('cari-barang-owner').value.toLowerCase();
    const cards = document.querySelectorAll('#owner-list-cards .report-card');

    cards.forEach(card => {
        const nama = card.querySelector('h4').innerText.toLowerCase();
        if (nama.includes(input)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}
function laporPenjualan(id, nama, hargaSaran) {
    document.getElementById('lapor-id').value = id;
    document.getElementById('lapor-info-barang').innerText = `Barang: ${nama} \n(Saran: Rp ${hargaSaran.toLocaleString()})`;
    document.getElementById('lapor-harga-input').value = hargaSaran; // Default isi harga saran
    document.getElementById('modal-lapor').style.display = 'flex';
}

// 2. Fungsi buat tutup modal
function tutupModalLapor() {
    document.getElementById('modal-lapor').style.display = 'none';
}

async function handleOwnerLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userIn, password: passIn })
        });
        
        if (response.ok) {
            alert("Login berhasil");
            showSection('owner-menu');
        } else {
            alert("Gagal: Username atau Password salah!");
        }
    } catch (err) {
        alert("Gagal koneksi ke Server! Cek terminal Java lo.");
    }
}
async function handleInputBarang() {
    const data = {
        nama: document.getElementById('namaBarang').value,
        hargaModal: parseFloat(document.getElementById('hargaModal').value),
        hargaPerkiraanJual: parseFloat(document.getElementById('hargaJual').value),
        stok: parseInt(document.getElementById('stok').value)
    };

    try {
        const response = await fetch(`${API_URL}/api/barang`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        alert(text);

        document.getElementById('namaBarang').value = "";
        document.getElementById('hargaModal').value = "";
        document.getElementById('hargaJual').value = "";
        document.getElementById('stok').value = "";

        showSection('owner-menu');
    } catch (err) {
        alert("Gagal simpan! Cek terminal Java lo.");
    }
}

function filterBarangReseller() {
    const input = document.getElementById('cari-barang').value.toLowerCase();
    // Pastikan selector-nya kena ke kartu
    const cards = document.querySelectorAll('#reseller-list-cards .report-card');

    cards.forEach(card => {
        const nama = card.querySelector('h4').innerText.toLowerCase();
        // Pakai display 'flex' karena di CSS .report-card lo pake flex
        if (nama.includes(input)) {
            card.style.display = 'flex'; 
        } else {
            card.style.display = 'none';
        }
    });
}
function bukaModalEdit(id, nama, modal, jual) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nama').value = nama;
    document.getElementById('edit-modal').value = modal;
    document.getElementById('edit-jual').value = jual;
    document.getElementById('modal-edit').style.display = 'flex';
}

function tutupModalEdit() {
    document.getElementById('modal-edit').style.display = 'none';
}

async function simpanPerubahanBarang() {
    const id = document.getElementById('edit-id').value;
    const data = {
        nama: document.getElementById('edit-nama').value,
        hargaModal: parseFloat(document.getElementById('edit-modal').value),
        hargaPerkiraanJual: parseFloat(document.getElementById('edit-jual').value)
    };

    try {
        const response = await fetch(`${API_URL}/api/barang/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Data berhasil diupdate!");
            tutupModalEdit();
            muatKatalog('tabel-owner'); // Refresh tabel
        } else {
            alert("Gagal update data!");
        }
    } catch (err) {
        console.error(err);
        alert("Server error!");
    }
}
function filterRiwayat() {
    const input = document.getElementById('cari-transaksi').value.toLowerCase();
    const cards = document.querySelectorAll('#riwayat-list-cards .report-card');
    cards.forEach(card => {
        const teks = card.innerText.toLowerCase();
        card.style.display = teks.includes(input) ? 'flex' : 'none';
    });
}
// Booking Feature

async function handleBooking(idBarang) {
    const nama = prompt("Nama Pembooking:");
    const tanggal = prompt("Janji bayar (YYYY-MM-DD):", "2026-04-30");
    
    if (!nama || !tanggal) return;

    const resp = await fetch(`${API_URL}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idBarang: idBarang,
            nama: nama,
            jumlah: 1, // Default 1 dulu
            tanggal: tanggal
        })
    });

    const res = await resp.json();
    alert(res.message);
    if(res.success) location.reload(); // Refresh biar stok terupdate
}
async function muatDaftarBooking() {
    const resp = await fetch(`${API_URL}/api/booking/list`);
    const res = await resp.json();
    
    const container = document.getElementById('booking-list-cards');
    container.innerHTML = ''; 

    if(res.success && res.data.length > 0) {
        res.data.forEach(bk => {
            const card = 
                `<div class="report-card" style="border-left: 5px solid #00ffcc;">
                    <div class="report-header">
                        <span>ID Booking: ${bk.id}</span>
                        <span style="color: #ff3131;">Deadline: ${bk.batasPembayaranStr}</span>
                    </div>
                    <div class="report-body">
                        <h4 style="color: #00ccff;">${bk.namaBarang}</h4>
                        <p>Pembooking: <strong>${bk.namaPembooking}</strong></p>
                        <p>Jumlah: ${bk.jumlah} pcs</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="prosesBayarBooking(${bk.id})">LUNAS</button>
                        <button onclick="handleCancelBooking(${bk.id})" style="border-color: #ff3131; color: #ff3131;">CANCEL</button>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } else {
        container.innerHTML = `<p style="text-align:center;">Tidak ada booking aktif</p>`;
    }
}

// Tambahkan Fitur Search Booking
function filterBooking() {
    const keyword = document.getElementById('cari-booking').value.toLowerCase();
    const cards = document.querySelectorAll('#booking-list-cards .card');
    
    cards.forEach(card => {
        const isiCard = card.innerText.toLowerCase();
        card.style.display = isiCard.includes(keyword) ? "block" : "none";
    });
}
async function prosesBayarBooking(id) {
    const harga = prompt("Masukkan Harga Jual Final:");
    if (!harga || isNaN(harga)) return;

    try {
        const resp = await fetch(`${API_URL}/api/booking/lunas/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku: harga })
        });
        const res = await resp.json();
        alert(res.message);
        if (res.success) muatDaftarBooking(); // Refresh tabel booking
    } catch (err) {
        alert("Terjadi kesalahan sistem.");
    }
}
async function handleCancelBooking(id) {
    if(!confirm("Yakin mau cancel booking ini? Stok akan dikembalikan.")) return;

    const resp = await fetch(`${API_URL}/api/booking/cancel/${id}`, {
        method: 'POST'
    });
    const res = await resp.json();
    alert(res.message);
    if(res.success) muatDaftarBooking(); // Refresh tabel
}
function exitApp() {
    if(confirm("Yakin mau keluar?")) {
        window.close(); // Cuma jalan di beberapa browser, atau arahkan ke page lain
        alert("Aplikasi Berhenti.");
    }
}
showSection('main-menu');