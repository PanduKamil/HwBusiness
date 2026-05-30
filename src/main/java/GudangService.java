import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GudangService {
    private static GudangService instance;
    private MainanDAO mainanDAO = new MainanDAO();
    private ArusKasDAO arusKasDAO = new ArusKasDAO();
    private UserDAO userDAO = new UserDAO();

    public static synchronized GudangService getInstance(){ 
        if (instance == null) {
            instance = new GudangService();
        }
        return instance;
    }

    public boolean authenticate(String user, String pass) {
        try (Connection conn = DatabaseConnection.getConnection()) {
            return userDAO.verifyPassword(conn, user, pass);
        } catch (SQLException e) {
            System.err.println("Gagal autentikasi: " + e.getMessage());
            return false;
        }
    }
    public void prosesPenjualan(int idInput, BigDecimal hargaLaku) throws GudangException {
    try (Connection conn = DatabaseConnection.getConnection()) {
        conn.setAutoCommit(false);
        try {
            // PINDAH cariBarang ke dalam blok conn yang sama
            Mainan m = mainanDAO.cariBarang(idInput, conn); // ← pakai overload dengan conn

            if (m == null) throw new GudangException("Barang dengan ID: " + idInput + " tidak ditemukan!");
            if (m.getStok() <= 0) throw new StokKurangException("Stok Barang " + m.getNama() + " Kosong");

            BigDecimal profitKotor = FinanceCalculator.hitungProfitKotor(hargaLaku, m.getHargaModal(), 1);
            BigDecimal komisiReseller = FinanceCalculator.hitungKomisi(profitKotor);
            BigDecimal labaOwner = FinanceCalculator.hitungNetProfit(profitKotor, komisiReseller);
            BigDecimal modalSnapshot = m.getHargaModal();

            m.kurangiStok(1);
            mainanDAO.updateBarang(m, conn);
            mainanDAO.catatTransaksi(m, 1, hargaLaku, komisiReseller, labaOwner, modalSnapshot, conn);

            BigDecimal modalBarang = m.getHargaModal();
            arusKasDAO.catat(conn, "MASUK", "MODAL", modalBarang, "Modal balik dari penjualan: " + m.getNama());
            arusKasDAO.catat(conn, "MASUK", "PROFIT", labaOwner, "Laba owner dari penjualan: " + m.getNama());
            arusKasDAO.catat(conn, "MASUK", "RESELLER", komisiReseller, "Komisi reseller dari penjualan: " + m.getNama());

            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw new GudangException("(Proses Transaksi)Gagal eksekusi query internal: " + e.getMessage());
        }
    } catch (SQLException e) {
        throw new GudangException("Gagal Memproses Transaksi: " + e.getMessage());
    }
}
    public String simpanMainan(Mainan barangBaru)throws Exception{ //Cek Barang
        Mainan existing = mainanDAO.cariBarangAccordingName(barangBaru.getNama());
        String message = "";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // HITUNG TOTAL PENGELUARAN 
                // Hitung total duit modal yang keluar buat belanja unit baru ini
                BigDecimal totalPengeluaranModal = barangBaru.getHargaModal().multiply(new BigDecimal(barangBaru.getStok()));
                
                if (existing != null) {
                    //Modal Rata-rata
                    BigDecimal modalBaruAvg = FinanceCalculator.hitungRataRataModal(existing.getStok(), existing.getHargaModal(), 
                                                barangBaru.getStok(), barangBaru.getHargaModal());
                    existing.setHargaModal(modalBaruAvg);
                    //update stok
                    existing.setStok(existing.getStok() + barangBaru.getStok());
                    mainanDAO.updateBarang(existing, conn);

                    message = "Stok " + existing.getNama() +  " berhasil diperbaharui"; 
                }else{
                    mainanDAO.tambahMainan(barangBaru,conn);
                    message = "Barang baru berhasil didaftarkan";
                }
                // CATAT KAS KELUAR 
                // Potong dompet MODAL karena kita pakai duitnya buat belanja barang/restock
                arusKasDAO.catat(conn, "KELUAR", "MODAL", totalPengeluaranModal, 
                        "Kulakan barang: " + barangBaru.getNama() + " (x" + barangBaru.getStok() + ")");
            conn.commit();
            return message;
            }catch (Exception e) {
            conn.rollback();
            throw new Exception("Barang gagal disimpan " + e.getMessage());
        } 
        }
    }  
    public List<MainanReseller> lihatDaftarBarangReseller(){
        return mainanDAO.getKatalogReseller();
    }
    public List<Mainan> lihatDaftarBarangOwner(){
        return mainanDAO.getKatalogOwner();
    }
    public Laporan cetakLaporanOwner(Integer bulan, Integer tahun){
        return mainanDAO.getLaporanKeuangan(bulan, tahun);
    }
    public Laporan cetakLaporanBulanan(int bulan, int tahun){
        return mainanDAO.getLaporanBulanan(bulan, tahun);
    }
    public void editBarang(int id, String nama, BigDecimal hargaModal, BigDecimal hargaJual) throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                Mainan m = mainanDAO.cariBarang(id, conn); // ← pindah ke dalam, pakai conn
                if (m == null) throw new Exception("Barang dengan ID: " + id + " tidak ditemukan!");

                m.setNama(nama);
                m.setHargaModal(hargaModal);
                m.setHargaPerkiraanJual(hargaJual);

                mainanDAO.updateBarang(m, conn);
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw new Exception("Gagal mengupdate barang: " + e.getMessage());
            }
        } catch (SQLException e) {
            throw new Exception("Gagal mengupdate barang: " + e.getMessage());
        }
    }
    public List<TransaksiDTO> lihatRiwayatTransaksi(){
        return mainanDAO.getAllTransaksi();
    } 
    
    public void batalkanTransaksi(int idTransaksi) {
    Connection conn = null;
    try {
        conn = DatabaseConnection.getConnection();
        conn.setAutoCommit(false); // Kunci dimulai!

        // Panggil DAO dengan mengirimkan 'conn' yang sama
        // Gak perlu getTransaksiById terpisah kalau di DAO udah dihandle semua
        mainanDAO.deleteTransaksi(conn, idTransaksi);

        conn.commit(); // Kalau sukses semua, simpan!
        System.out.println("Transaksi hangus, stok aman balik ke rak.");

    } catch (Exception e) {
        if (conn != null) {
            try {
                conn.rollback(); // Kalau ada satu aja yang gagal, tarik balik semua!
                System.err.println("Gagal! Data dikembalikan ke kondisi awal.");
            } catch (SQLException ex) { ex.printStackTrace(); }
        }
        throw new RuntimeException("Error: " + e.getMessage());
    } finally {
        if (conn != null) {
            try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }
}
    // ---- Booking Logic
    public void prosesBooking(int idBarang, String namaCustomer, int jumlah, String tglJanji) throws Exception {
    try (Connection conn = DatabaseConnection.getConnection()) {
        conn.setAutoCommit(false);
        try {
            Mainan m = mainanDAO.cariBarang(idBarang, conn); // ← pindah ke dalam, pakai conn
            if (m == null) throw new Exception("Barang tidak ditemukan!");
            if (m.getStok() < jumlah) throw new Exception("Stok tidak mencukupi untuk dibooking!");

            LocalDate deadline = LocalDate.parse(tglJanji);

            Booking booking = new Booking(0, idBarang, namaCustomer, jumlah, deadline, "ACTIVE", m.getNama());

            m.setStok(m.getStok() - jumlah);
            mainanDAO.updateBarang(m, conn);
            mainanDAO.tambahBooking(booking, conn);

            conn.commit();
        } catch (Exception e) {
            conn.rollback();
            throw e;
        }
    }
}
    public List<Booking> lihatDaftarBooking(){
        return mainanDAO.getActiveBookings();
    }
    // ----- cancel booking feature
    public void cancelBooking(int bookingId) throws Exception {
        // 1. Ambil data booking dulu (Pakai versi mandiri)
        Booking bk = mainanDAO.getBookingById(bookingId); 
        if (bk == null) throw new Exception("Data booking tidak ditemukan!");

        // 2. Buka koneksi baru untuk TRANSAKSI
        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false); // Kunci transaksi
            try {
                // A. Balikin stok
                Mainan m = mainanDAO.cariBarang(bk.getBarangId());
                m.setStok(m.getStok() + bk.getJumlah());
                mainanDAO.updateBarang(m, conn);

                // B. Update status jadi CANCELLED
                mainanDAO.updateStatusBooking(bookingId, "CANCELLED", conn);

                conn.commit(); // Eksekusi semua
            } catch (Exception e) {
                conn.rollback(); // Batalkan jika ada yang gagal
                throw e;
            }
        }
    }

    public void prosesPelunasan(int bookingId, BigDecimal hargaLaku) throws Exception {
    try (Connection conn = DatabaseConnection.getConnection()) {
        conn.setAutoCommit(false);
        try {
            Booking bk = mainanDAO.getBookingById(bookingId, conn); // ← pakai overload dengan conn
            if (bk == null) throw new Exception("Data booking tidak ditemukan!");

            Mainan m = mainanDAO.cariBarang(bk.getBarangId(), conn); // ← sudah pakai conn
            if (m == null) throw new Exception("Data Barang asal tidak ditemukan");


                BigDecimal profitKotor = FinanceCalculator.hitungProfitKotor(hargaLaku, m.getHargaModal(), bk.getJumlah());
                BigDecimal komisi = FinanceCalculator.hitungKomisi(profitKotor);
                BigDecimal profitOwner = FinanceCalculator.hitungNetProfit(profitKotor, komisi);

                // prosesPelunasan() — sama
                BigDecimal modalSnapshot = m.getHargaModal(); // freeze avg saat ini
                mainanDAO.catatTransaksi(m, bk.getJumlah(), hargaLaku, komisi, profitOwner, modalSnapshot, conn);
                //                                                  
                mainanDAO.updateStatusBooking(bookingId, "COMPLETED", conn);
                // ================= LOGIC BARU: PISAH DUIT PELUNASAN BOOKING =================
                // 1. Hitung total modal dari barang-barang yang laku di booking ini
                BigDecimal totalModalBooking = m.getHargaModal().multiply(new BigDecimal(bk.getJumlah()));
                
                // 2. Balikin total modal ke dompet MODAL
                arusKasDAO.catat(conn, "MASUK", "MODAL", totalModalBooking, 
                        "Modal balik dari pelunasan booking: " + m.getNama() + " (x" + bk.getJumlah() + ")");
                
                // 3. Masukkan laba bersih owner ke dompet PROFIT
                arusKasDAO.catat(conn, "MASUK", "PROFIT", profitOwner, 
                        "Profit dari pelunasan booking: " + m.getNama());
                arusKasDAO.catat(conn, "MASUK", "RESELLER", komisi, 
                        "Komisi reseller dari penjualan: " + m.getNama());
                // ============================================================================
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
                System.err.println("Transaksi Gagal, Rollback" + e.getMessage());
                throw e;
            }
        }
    }
    // ─── TAMBAH private helper ini ───────────────────────────────────────────────
// PUBLIC — tetap ada, dipanggil dari luar (ApiServer, dll) — TIDAK DIUBAH
public BigDecimal getSaldoDompet(String dompet) throws Exception {
    try (Connection conn = DatabaseConnection.getConnection()) {
        return arusKasDAO.getSaldoBersih(conn, dompet);
    } catch (SQLException e) {
        throw new Exception("Gagal menghitung saldo: " + e.getMessage());
    }
}

// PRIVATE — overload baru, dipanggil internal dalam satu transaksi
private BigDecimal getSaldoDompet(Connection conn, String dompet) throws SQLException {
    return arusKasDAO.getSaldoBersih(conn, dompet);
}

// ─── GANTI getDashboardKeuangan() ────────────────────────────────────────────
public Map<String, Object> getDashboardKeuangan() throws Exception {
    try (Connection conn = DatabaseConnection.getConnection()) {
        Map<String, Object> data = new HashMap<>();

        // Semua query pakai conn yang SAMA — snapshot data konsisten
        data.put("danaBelanjaModal", getSaldoDompet(conn, "MODAL"));
        data.put("profitSaatIni",    getSaldoDompet(conn, "PROFIT"));
        data.put("komisiSaatIni",    getSaldoDompet(conn, "RESELLER"));

        data.put("profitAllTime",  arusKasDAO.getRawTotal(conn, "MASUK", "PROFIT"));
        data.put("komisiAllTime",  arusKasDAO.getRawTotal(conn, "MASUK", "RESELLER"));

        return data;
    } catch (SQLException e) {
        throw new Exception("Gagal memuat dashboard keuangan: " + e.getMessage());
    }
}
    // RESET DOMPET
    // 1. Logic untuk mereset / mencairkan Profit Owner
    public void resetProfitOwner() throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // Ambil saldo profit saat ini yang siap ditarik
                BigDecimal saldoSaatIni = getSaldoDompet("PROFIT");
                
                // Validasi: Kalau profitnya kosong, gak ada yang bisa ditarik
                if (saldoSaatIni.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new Exception("Tidak ada profit owner yang bisa dicairkan/di-reset!");
                }

                // Catat transaksi KELUAR untuk mereset saldo menjadi Rp0
                arusKasDAO.catat(conn, "KELUAR", "PROFIT", saldoSaatIni, "Penarikan/Pencairan seluruh profit oleh owner");
                
                conn.commit();
            } catch (Exception e) {
                conn.rollback(); // Kembalikan ke state semula jika proses gagal
                throw e;
            }
        } catch (SQLException e) {
            throw new Exception("Gagal mereset profit owner: " + e.getMessage());
        }
    }

    // 2. Logic untuk mereset / mencairkan Komisi Reseller
    public void resetKomisiReseller() throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // Ambil saldo komisi reseller saat ini yang mengendap
                BigDecimal saldoSaatIni = getSaldoDompet("RESELLER");
                
                // Validasi: Kalau komisinya kosong, gak bisa di-reset
                if (saldoSaatIni.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new Exception("Tidak ada komisi reseller yang bisa dicairkan/di-reset!");
                }

                // Catat transaksi KELUAR untuk mereset saldo reseller menjadi Rp0
                arusKasDAO.catat(conn, "KELUAR", "RESELLER", saldoSaatIni, "Penarikan/Pencairan komisi oleh reseller");
                
                conn.commit();
            } catch (Exception e) {
                conn.rollback(); // Rollback jika ada error SQL di tengah jalan
                throw e;
            }
        } catch (SQLException e) {
            throw new Exception("Gagal mereset komisi reseller: " + e.getMessage());
        }
    }
    // Mengamankan data profit owner (Saldo Saat Ini & All-Time)
    public Map<String, Object> getDataProfitOwner() throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            BigDecimal saldoSaatIni = getSaldoDompet("PROFIT");
            BigDecimal allTimeCuan = arusKasDAO.getRawTotal(conn, "MASUK", "PROFIT");

            Map<String, Object> data = new HashMap<>();
            data.put("saldoSaatIni", saldoSaatIni);
            data.put("allTimeCuan", allTimeCuan);
            return data;
        } catch (SQLException e) {
            throw new Exception("Gagal memuat data profit owner: " + e.getMessage());
        }
    }

    // Mengamankan data komisi reseller (Saldo Saat Ini & All-Time)
    public Map<String, Object> getDataKomisiReseller() throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            BigDecimal saldoSaatIni = getSaldoDompet("RESELLER");
            BigDecimal allTimeKomisi = arusKasDAO.getRawTotal(conn, "MASUK", "RESELLER");

            Map<String, Object> data = new HashMap<>();
            data.put("saldoSaatIni", saldoSaatIni);
            data.put("allTimeKomisi", allTimeKomisi);
            return data;
        } catch (SQLException e) {
            throw new Exception("Gagal memuat data komisi reseller: " + e.getMessage());
        }
    }
    // RIWAYAT DOMPET
    public List<Map<String, Object>> getRiwayatMutasiKas() throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            return arusKasDAO.getRiwayatMutasi(conn);
        } catch (SQLException e) {
            throw new Exception("Gagal mengambil riwayat mutasi kas dari database: " + e.getMessage());
        }
    }
}

