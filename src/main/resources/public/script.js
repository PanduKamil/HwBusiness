const API_URL = "http://localhost:7070/api";
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
    const field = ['display-omset', 'display-komisi', 'display-bersih', 'display-periode'];
    field.forEach(f =>{
        const fieldEL = document.getElementById(f);
        if (fieldEL) fieldEL.innerText = (f === 'display-periode') ? "-" : "Rp 0";
    });
}
// 2. Fungsi Ambil Data (GET)
async function muatKatalog(targetTableId) {
    try {
        const response = await fetch(`${API_URL}/barang`);
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
        const response = await fetch(`${API_URL}/barang`);
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
                    <td>Rp ${m.hargaPerkiraanJual.toLocaleString()}</td>
                    <td><button onclick="laporPenjualan(${m.id}, '${m.nama}',${m.hargaPerkiraanJual})">
                    laku</button></td>
                </tr>`;
            tbody.innerHTML += baris;
        });
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
    } catch (error) {
        console.error("Gagal total:", error);
        alert("Server mati atau database error!");
    }
}
async function laporPenjualan(id, nama, hargaSaran) {
    // Prompt sederhana, gak makan RAM gede dibanding bikin modal pop-up custom
    const hargaInput = prompt(`Barang: ${nama}\nHarga Saran: Rp ${hargaSaran.toLocaleString()}\nJual di harga berapa?`, hargaSaran);
    
    if (hargaInput === null) return; 

    const hargaLaku = parseFloat(hargaInput);
    if (isNaN(hargaLaku) || hargaLaku <= 0) return alert("Input harga gak bener, Bree!");

    try {
        const response = await fetch(`${API_URL}/transaksi/jual/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hargaLaku: hargaLaku })
        });

        if (response.ok) {
            alert("Mantap! Stok otomatis berkurang.");
            muatKatalogReseller('reseller-table'); // Auto-refresh tabel
        } else {
            const errorMsg = await response.text();
            alert("Gagal: " + errorMsg);
        }
    } catch (err) {
        console.error(err);
        alert("Server mati atau koneksi putus!");
    }
}
async function laporTerjual(id, nama, harga) {
    const hargaInput = prompt(`Barang : ${nama}\nHarga : Rp ${harga.toLocaleString()}
    \n\nJual di harga `, harga);

    if (hargaInput === null) return;
    const hargaLaku = parseFloat(hargaInput);
    if (isNaN(hargaLaku) || hargaLaku <= 0) {
        return alert("Harga tidak valid");
    }
    try {
        const response = await fetch(`${API_URL}/transaksi/jual`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({
                id: id, 
                hargaLaku: hargaLaku
            })
            });
            if (response.ok) {
                alert("Gokil!! penjualan udh kedata bre")

                muatKatalogReseller('reseller-table');
            }else{
                const pesanError = await response.text();
                alert("Gagal : " + pesanError);
            }
    } catch (error) {
        alert("Server Error")
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
    document.getElementById('display-bersih').innerText = data.bersih;
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
function exitApp() {
    if(confirm("Yakin mau keluar?")) {
        window.close(); // Cuma jalan di beberapa browser, atau arahkan ke page lain
        alert("Aplikasi Berhenti.");
    }
}
showSection('main-menu');