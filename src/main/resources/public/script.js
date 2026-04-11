const API_URL = `http://${window.location.hostname}:7070/api`;
// 1. Fungsi Navigasi Utama
function showSection(idTerpilih) {
    //sembunyikan semua yang punya class section
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    //section yg dipilih
    const el = document.getElementById(idTerpilih);
    if (el) el.style.display = 'block';
    
    //kosongkan input tiap pindah section
    const inputBulan = document.getElementById('filter-bulan');
    const inputTahun = document.getElementById('filter-tahun');

    if (inputBulan) document.getElementById('filter-bulan').value ="";
    if (inputTahun) document.getElementById('filter-tahun').value = "2026";
    //Reset angka Laporan
    const field = ['display-omset', 'display-komisi', 'display-profit', 'display-periode'];
    field.forEach(f =>{
        const fieldEL = document.getElementById(f);
        if (fieldEL) fieldEL.innerText = (f === 'display-periode') ? "-" : "Rp 0";
    });
}
// 2. Fungsi Ambil Data (GET)
async function muatKatalog() {
    try {
        const response = await fetch(`${API_URL}/barang`);
        const dataBarang = await response.json();

        const listContainer = document.getElementById('owner-list-cards');
        if (!listContainer) return;

        listContainer.innerHTML = ""; 

        if (dataBarang.length === 0) {
            listContainer.innerHTML = "<p style='text-align:center;'>Gudang kosong, silakan input barang.</p>";
            return;
        }

        dataBarang.forEach(m => {
            // Kita samain formatnya kyak reseller, tapi isinya lebih lengkap (ada harga modal)
            const card = `
                <div class="report-card" style="border-left: 5px solid #00ccff;">
                    <div class="report-header">
                        <span class="id-tag">ID: ${m.id}</span>
                        <span class="stock-tag">Stok: ${m.stok}</span>
                    </div>
                    <div class="report-body">
                        <h4>${m.nama}</h4>
                        <p class="price" style="color: #ffcc00; margin-bottom: 5px;">Modal: Rp ${m.hargaModal.toLocaleString()}</p>
                        <p class="price">Jual: Rp ${m.hargaPerkiraanJual.toLocaleString()}</p>
                    </div>
                    <button onclick="bukaModalEdit(${m.id}, '${m.nama}', ${m.hargaModal}, ${m.hargaPerkiraanJual})" 
                            style="border-color: #00ccff; color: #00ccff;">
                        EDIT BARANG
                    </button>
                </div>`;
            listContainer.innerHTML += card;
        });
    } catch (error) {
        console.error("Gagal muat katalog owner:", error);
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
async function muatKatalogReseller() { // Gak perlu targetTableId lagi
    try {
        const response = await fetch(`${API_URL}/barang`);
        const dataBarang = await response.json();

        const listContainer = document.getElementById('reseller-list-cards');
        if (!listContainer) return;

        listContainer.innerHTML = ""; 

        if (dataBarang.length === 0) {
            listContainer.innerHTML = "<p style='text-align:center;'>Barang kosong, Bree.</p>";
            return;
        }

        dataBarang.forEach(m => {
            const card =`
                <div class="report-card">
                    <div class="report-header">
                        <span class="id-tag">ID: ${m.id}</span>
                        <span class="stock-tag ${m.stok <= 0 ? 'empty' : ''}">Stok: ${m.stok}</span>
                    </div>
                    <div class="report-body">
                        <h4>${m.nama}</h4>
                        <p class="price">Harga: Rp ${m.hargaPerkiraanJual.toLocaleString()}</p>
                    </div>
                    <button onclick="laporPenjualan(${m.id}, '${m.nama}', ${m.hargaPerkiraanJual})" 
                            ${m.stok <= 0 ? 'disabled' : ''}>
                        ${m.stok <= 0 ? 'STOK HABIS' : 'LAPOR TERJUAL'}
                    </button>
                </div>`;
            listContainer.innerHTML += card;
        });
    } catch (error) {
        console.error("Gagal:", error);
    }
}
/*OPSIONAL ALERT KALAU GW PAKE INI WHERE STOK > 0 HARUS DIHAPUS
        // Di script.js bagian muatKatalogReseller
        dataBarang.forEach(m => {
            const baris = 
                <tr>
                    <td>${m.id}</td>
                    <td>${m.nama}</td>
                    <td>${m.stok}</td>
                    <td>Rp ${m.hargaPerkiraanJual.toLocaleString()}</td>
                    <td>
                        <button onclick="laporPenjualan(${m.id}, '${m.nama}', ${m.hargaPerkiraanJual})" 
                                ${m.stok <= 0 ? 'disabled' : ''}>
                            ${m.stok <= 0 ? 'Habis' : 'Laku'}
                        </button>
                    </td>
                </tr>;
            tbody.innerHTML += baris;
        }); */
// 1. Fungsi buat buka modal dan isi datanya
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

// 3. Fungsi eksekusi kirim ke Java (API)
async function eksekusiLaporPenjualan() {
    const id = document.getElementById('lapor-id').value;
    const hargaLaku = parseFloat(document.getElementById('lapor-harga-input').value);

    if (isNaN(hargaLaku) || hargaLaku <= 0) {
        alert("Harga laku nggak valid, Bree!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transaksi/jual/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku: hargaLaku })
        });

        if (response.ok) {
            alert("Mantap! Stok otomatis berkurang.");
            tutupModalLapor();
            muatKatalogReseller(); // Refresh kartu reseller
        } else {
            const errorMsg = await response.text();
            alert("Gagal: " + errorMsg);
        }
    } catch (err) {
        console.error(err);
        alert("Server mati atau koneksi putus!");
    }
}
// 2. Fungsi Login
async function handleOwnerLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
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



// 4. Fungsi Input Barang (POST)
async function handleInputBarang() {
    const data = {
        nama: document.getElementById('namaBarang').value,
        hargaModal: parseFloat(document.getElementById('hargaModal').value),
        hargaPerkiraanJual: parseFloat(document.getElementById('hargaJual').value),
        stok: parseInt(document.getElementById('stok').value)
    };

    try {
        const response = await fetch(`${API_URL}/barang`, {
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
// 5. Fungsi cek Laporan total
async function muatLaporanOwner() {
    const response = await fetch(`${API_URL}/laporan/total`);
    const data = await response.json(); // Isinya object dari class Laporan
    
    // Perhatikan nama field-nya harus sama ama di Java (Laporan.java)
    document.getElementById('display-omset').innerText = data.omset;
    document.getElementById('display-komisi').innerText = data.komisi;
    document.getElementById('display-profit').innerText = data.bersih;
    alert("Laporan untuk: " + data.label);
}
// Fungsi Laporan Semua Periode
async function muatLaporanTotal() {
    try {
        const response = await fetch(`${API_URL}/laporan/total`);
        const data = await response.json();
        updateTampilanLaporan(data);
    } catch (err) {
        alert("Gagal ambil laporan total!");
    }
}

// Fungsi Laporan Filter Bulan & Tahun
async function handleLaporanFilter() {
    const bulan = document.getElementById('filter-bulan').value;
    const tahun = document.getElementById('filter-tahun').value;

    if (!bulan || !tahun) return alert("Isi bulan ama tahun dulu, Bree!");

    try {
        const response = await fetch(`${API_URL}/laporan/bulanan/${bulan}/${tahun}`);
        const data = await response.json();
        updateTampilanLaporan(data);
    } catch (err) {
        alert("Gagal ambil laporan bulanan!");
    }
}

// Helper biar gak nulis ulang-ulang
function updateTampilanLaporan(data) {
    // Pake toLocaleString biar angkanya ada titik ribuan (Rp 1.000.000)
    document.getElementById('display-omset').innerText = "Rp " + data.omset.toLocaleString();
    document.getElementById('display-komisi').innerText = "Rp " + data.komisi.toLocaleString();
    document.getElementById('display-profit').innerText = "Rp " + data.profit.toLocaleString();
    document.getElementById('display-periode').innerText = data.periode;
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
        const response = await fetch(`${API_URL}/barang/${id}`, {
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
// 1. Fungsi muat riwayat
async function muatRiwayat() {
    try {
        const response = await fetch(`${API_URL}/transaksi`); // Sesuaikan endpoint Java lo
        const dataTrx = await response.json();

        const container = document.getElementById('riwayat-list-cards');
        container.innerHTML = "";

        if (dataTrx.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>Belum ada transaksi masuk.</p>";
            return;
        }

        dataTrx.forEach(t => {
            const card = 
                <div class="report-card" style="border-left: 5px solid #ffcc00;">
                    <div class="report-header">
                        <span>ID Trx: ${t.id}</span>
                        <span>${t.tanggal}</span>
                    </div>
                    <div class="report-body">
                        <h4>${t.namaBarang}</h4>
                        <p class="price">Laku: Rp ${t.hargaLaku.toLocaleString()}</p>
                        <p style="font-size: 0.8rem; color: #888;">Profit: Rp ${t.profit.toLocaleString()}</p>
                    </div>
                    <button onclick="batalkanTransaksi(${t.id})" 
                            style="border-color: #ff4444; color: #ff4444; padding: 0.5rem; font-size: 0.8rem;">
                        BATALKAN (Hapus)
                    </button>
                </div>;
            container.innerHTML += card;
        });
    } catch (err) {
        console.error(err);
    }
}

// 2. Fungsi Batal Transaksi (Owner Power)
async function batalkanTransaksi(id) {
    if (!confirm("Yakin mau batalin transaksi ini? Stok bakal balik (+1) ke gudang!")) return;

    try {
        const response = await fetch(`${API_URL}/transaksi/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Transaksi dihapus, stok sudah dikembalikan!");
            muatRiwayat(); // Refresh riwayat
        } else {
            alert("Gagal menghapus transaksi.");
        }
    } catch (err) {
        alert("Server Error!");
    }
}

// 3. Filter Riwayat
function filterRiwayat() {
    const input = document.getElementById('cari-transaksi').value.toLowerCase();
    const cards = document.querySelectorAll('#riwayat-list-cards .report-card');
    cards.forEach(card => {
        const teks = card.innerText.toLowerCase();
        card.style.display = teks.includes(input) ? 'flex' : 'none';
    });
}
function exitApp() {
    if(confirm("Yakin mau keluar?")) {
        window.close(); // Cuma jalan di beberapa browser, atau arahkan ke page lain
        alert("Aplikasi Berhenti.");
    }
}
showSection('main-menu');