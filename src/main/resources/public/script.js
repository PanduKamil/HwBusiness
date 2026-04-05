// 1. Fungsi Navigasi Utama
function showSection(idTerpilih) {
    // Masukin SEMUA ID div yang ada di HTML 
    const semuaMenu = [
        'main-menu', 
        'owner-login', 
        'owner-menu', 
        'input-barang', 
        'katalog-barang', 
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
                    <td>Rp ${(m.hargaPerkiraanjual || 0).toLocaleString()}</td>
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
                    <td>Rp ${(m.hargaPerkiraanjual || 0).toLocaleString()}</td>
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
        hargaPerkiraanjual: parseFloat(document.getElementById('hargaJual').value),
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
        showSection('owner-menu');
    } catch (err) {
        alert("Gagal simpan! Cek terminal Java lo.");
    }
}
function exitApp() {
    if(confirm("Yakin mau keluar?")) {
        window.close(); // Cuma jalan di beberapa browser, atau arahkan ke page lain
        alert("Aplikasi Berhenti.");
    }
}