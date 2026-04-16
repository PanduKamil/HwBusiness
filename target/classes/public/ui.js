export const GudangUi = {

    //Katalog Owner
    templateCardOwner(m){
        return `<div class="report-card" style="border-left: 5px solid #00ccff;">
                    <div class="report-header"><span>ID: ${m.id}</span><span>Stok: ${m.stok}</span></div>
                    <div class="report-body">
                        <h4>${m.nama}</h4>
                        <p>Modal: Rp ${m.hargaModal.toLocaleString()}</p>
                        <p>Jual: Rp ${m.hargaPerkiraanJual.toLocaleString()}</p>
                    </div>
                    <button onclick="bukaModalEdit(${m.id}, '${m.nama}', ${m.hargaModal}, ${m.hargaPerkiraanJual})">EDIT</button>
                </div>`;
    },

    //Katalog Reseller
    templateCardReseller(m){
        return `<div class="report-card">
                    <div class="report-header"><span>ID: ${m.id}</span><span class="${m.stok <= 0 ? 'empty' : ''}">Stok: ${m.stok}</span></div>
                    <div class="report-body"><h4>${m.nama}</h4><p>Harga: Rp ${m.hargaPerkiraanJual.toLocaleString()}</p></div>
                    <button onclick="laporPenjualan(${m.id}, '${m.nama}', ${m.hargaPerkiraanJual})" ${m.stok <= 0 ? 'disabled' : ''}>
                        ${m.stok <= 0 ? 'STOK HABIS' : 'LAPOR TERJUAL'}
                    </button>
                    <button onclick="handleBooking(${m.id})" style="background-color: #ff00ff;" ${m.stok <= 0 ? 'disabled' : ''}>
                    BOOK
                </button>
                </div>`;
    },

    // Riwayat Transaksi
    templateCardRiwayat(t){
        return `<div class="report-card" style="border-left: 5px solid #ffcc00;">
                    <div class="report-header"><span>Trx: ${t.id}</span><span>${t.tanggal}</span></div>
                    <div class="report-body"><h4>${t.namaBarang}</h4><p>Laku: Rp ${t.hargaLaku.toLocaleString()}</p></div>
                    <button onclick="batalkanTransaksi(${t.id})" style="color:red; border-color:red;">BATALKAN</button>
                </div>`;
    },

    // Lapor Penjualan
    updateTampilanLaporan(data) {
        document.getElementById('display-omset').innerText = "Rp " + data.omset.toLocaleString();
        document.getElementById('display-komisi').innerText = "Rp " + data.komisi.toLocaleString();
        document.getElementById('display-profit').innerText = "Rp " + data.profit.toLocaleString();
        document.getElementById('display-modal').innerText = "Rp " + data.modal.toLocaleString();
        document.getElementById('display-periode').innerText = data.periode;

        // Logika ROI
        const profit = parseFloat(data.profit);
        const modal = parseFloat(data.modal);
        const roi = modal > 0 ? (profit / modal) * 100 : 0;

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
    },
    // Modal Lapor
    isiModalLapor(id, nama, hargaSaran){
        document.getElementById('lapor-id').value = id;
        document.getElementById('lapor-info-barang').innerText = `Barang: ${nama} \n(Saran: Rp ${hargaSaran.toLocaleString()})`;
        document.getElementById('lapor-harga-input').value = hargaSaran; // Default isi harga saran
        document.getElementById('modal-lapor').style.display = 'flex';
    },
    // Filter Barang
    filterBarang(idContainer, kataKunci) {
        const input = kataKunci.toLowerCase();
        const cards = document.querySelectorAll(`${idContainer} .report-card`);

        cards.forEach(card => {
            const nama = card.querySelector('h4').innerText.toLowerCase();
            card.style.display = nama.includes(input) ? 'flex' : 'none';
        });
    },
    
    // Pop Up Control
    toggleModal(id, nama, modal, jual){
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nama').value = nama;
        document.getElementById('edit-modal').value = modal;
        document.getElementById('edit-jual').value = jual;
        document.getElementById('modal-edit').style.display = 'flex';
    },

    //Booking
    templateCardBooking(bk){
        return `<div class="report-card" style="border-left: 5px solid #00ffcc;">
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
    },

    // Navigasi Section
    showSection(idTerpilih) {
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        const el = document.getElementById(idTerpilih);
        if (el) el.style.display = 'block';
    },








}
