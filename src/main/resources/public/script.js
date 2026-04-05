// 1. Fungsi Navigasi (Ganti Menu)
function tampilkanMenu(idMenu) {
    // Sembunyikan semua section dulu
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    // Tampilkan section yang dipilih
    document.getElementById(idMenu).style.display = 'block';
}

// 2. Fungsi Kirim Data ke Javalin (POST)
async function simpanBarang() {
    // Mengambil data dari Input HTML
    const payload = {
        nama: document.getElementById('namaBarang').value,
        hargaModal: parseFloat(document.getElementById('hargaModal').value),
        hargaPerkiraanjual: parseFloat(document.getElementById('hargaJual').value),
        stok: parseInt(document.getElementById('stok').value)
    };

    try {
        // "Ngetok pintu" ke Javalin
        const response = await fetch('http://localhost:7070/api/barang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const pesan = await response.text();
        alert(pesan); // Munculkan pesan "Barang berhasil diInput"
        tampilkanMenu('owner-menu'); // Balik ke menu owner
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal konek ke server Javalin!");
    }
}

// 3. Fungsi Ambil Data dari Javalin (GET)
async function muatKatalog() {
    try {
        const response = await fetch('http://localhost:7070/api/barang');
        const dataBarang = await response.json();
        
        let tabel = document.getElementById('tabel-katalog');
        tabel.innerHTML = ""; // Bersihkan tabel lama

        dataBarang.forEach(m => {
            tabel.innerHTML += `
                <tr>
                    <td>${m.id}</td>
                    <td>${m.nama}</td>
                    <td>${m.stok}</td>
                    <td>${m.hargaPerkiraanjual}</td>
                </tr>`;
        });
    } catch (error) {
        alert("Gagal mengambil data katalog");
    }
}
// Gunakan fungsi ini untuk pindah halaman/menu
function showSection(id) {
    // Sembunyikan semua div yang ada di dalam #app (kecuali h1)
    const sections = ['main-menu', 'owner-login', 'owner-menu', 'input-barang', 'reseller-menu'];
    sections.forEach(s => {
        const element = document.getElementById(s);
        if (element) element.style.display = 'none';
    });
    
    // Tampilkan yang dipilih
    document.getElementById(id).style.display = 'block';
}

// Fungsi Simpan (Pastikan Port 7070)
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
        alert("Server mati! Pastikan Main.java sudah di-run.");
    }
}