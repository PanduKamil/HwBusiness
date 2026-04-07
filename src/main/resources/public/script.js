// 1. Fungsi Navigasi Utama
function showSection(idTerpilih) {
    //sembunyikan semua section
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    //section yg dipilih
    document.getElementById(idTerpilih).style.display = 'block';

    //kosongkan input
    if (document.getElementById('filter-bulan')) {
        document.getElementById('filter-bulan').value ="";
    }
    if (document.getElementById('filter-bulan')) {
        document.getElementById('filter-bulan').value = "";
    }
    // Masukin SEMUA ID div yang ada di HTML 
    const semuaMenu = [
        'main-menu', 
        'owner-login', 
        'owner-menu', 
        'input-barang', 
        'katalog-barang', 
        'laporan-keuangan-section', 
        'reseller-menu'
    ];

    semuaMenu.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Sembunyiin semua, kecuali yang dipilih
            el.style.display = (id === idTerpilih) ? 'block' : 'none';
        }
    });

}
function backToMenu(){
    document.getElementById('filter-bulan').value="";
    showSection('owner-menu');
}
// 2. Fungsi Login
async function handleOwnerLogin() {
    const userIn = document.getElementById('user').value;
    const passIn = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:7070/api/login', {
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

// 3. Fungsi Ambil Data (GET)
async function muatKatalog(targetTableId) {
    try {
        const response = await fetch('http://localhost:7070/api/barang');
        const dataBarang = await response.json();
        console.log("Data dari Java:", dataBarang); // LIHAT DI CONSOLE F12

        const tbody = document.querySelector(`#${targetTableId} tbody`);
        if (!tbody) {
            console.error("Gak nemu <tbody> di tabel: " + targetTableId);
            return;
        }
        
        tbody.innerHTML = ""; 

        if (dataBarang.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>Barang kosong, silakan input dulu.</td></tr>";
            return;
        }

        dataBarang.forEach(m => {
            const baris = `
                <tr>
                    <td>${m.id}</td>
                    <td>${m.nama}</td>
                    <td>${m.stok}</td>
                    <td>Rp ${(m.hargaModal || 0).toLocaleString()}</td>
                    <td>Rp ${(m.hargaPerkiraanJual || 0).toLocaleString()}</td>
                </tr>`;
            tbody.innerHTML += baris;
        });
    } catch (error) {
        console.error("Gagal total:", error);
        alert("Server mati atau database error!");
    }
}
async function muatKatalogReseller(targetTableId) {
    try {
        const response = await fetch('http://localhost:7070/api/barang');
        const dataBarang = await response.json();
        console.log("Data dari Java:", dataBarang); // LIHAT DI CONSOLE F12

        const tbody = document.querySelector(`#${targetTableId} tbody`);
        if (!tbody) {
            console.error("Gak nemu <tbody> di tabel: " + targetTableId);
            return;
        }
        
        tbody.innerHTML = ""; 

        if (dataBarang.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>Barang kosong, silakan input dulu.</td></tr>";
            return;
        }

        dataBarang.forEach(m => {
            const baris = `
                <tr>
                    <td>${m.id}</td>
                    <td>${m.nama}</td>
                    <td>${m.stok}</td>
                    <td>Rp ${(m.hargaPerkiraanJual || 0).toLocaleString()}</td>
                </tr>`;
            tbody.innerHTML += baris;
        });
    } catch (error) {
        console.error("Gagal total:", error);
        alert("Server mati atau database error!");
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
        const response = await fetch('http://localhost:7070/api/barang', {
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
    const response = await fetch('http://localhost:7070/api/laporan/total');
    const data = await response.json(); // Isinya object dari class Laporan
    
    // Perhatikan nama field-nya harus sama ama di Java (Laporan.java)
    document.getElementById('display-omset').innerText = data.omset;
    document.getElementById('display-komisi').innerText = data.komisi;
    document.getElementById('display-bersih').innerText = data.bersih;
    alert("Laporan untuk: " + data.label);
}
// Fungsi Laporan Semua Periode
async function muatLaporanTotal() {
    try {
        const response = await fetch('http://localhost:7070/api/laporan/total');
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
        const response = await fetch(`http://localhost:7070/api/laporan/bulanan/${bulan}/${tahun}`);
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
function exitApp() {
    if(confirm("Yakin mau keluar?")) {
        window.close(); // Cuma jalan di beberapa browser, atau arahkan ke page lain
        alert("Aplikasi Berhenti.");
    }
}