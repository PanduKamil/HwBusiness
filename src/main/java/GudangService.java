import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public class GudangService {
    private static GudangService instance;
    private MainanDAO mainanDAO = new MainanDAO();
    private ArusKasDAO arusKasDAO = new ArusKasDAO();
    
    public static synchronized GudangService getInstance(){ 
        if (instance == null) {
            instance = new GudangService();
        }
        return instance;
    }
    public boolean authenticate(String user, String pass){
        return user.equals("Pandu Kamil") && pass.equals("Panduak27");
    }
    public void prosesPenjualan(int idInput, BigDecimal hargaLaku) throws GudangException{
            Mainan m = mainanDAO.cariBarang(idInput);

            //Validation
            if (m == null) throw new GudangException("Barang dengan ID: " + idInput + "tidak ditemuka!!");

            if (m.getStok() <= 0) throw new StokKurangException("Stok Barang " + m.getNama() + " Kosong");


            BigDecimal profitKotor = FinanceCalculator.hitungProfitKotor(hargaLaku, m.getHargaModal(), 1);
            BigDecimal komisiReseller = FinanceCalculator.hitungKomisi(profitKotor);
            BigDecimal labaOwner = FinanceCalculator.hitungNetProfit(profitKotor, komisiReseller);

        try (Connection conn = DatabaseConnection.getConnection()){
            conn.setAutoCommit(false);
            try {
            m.kurangiStok(1);
            mainanDAO.updateBarang(m, conn);
            mainanDAO.catatTransaksi(m, 1, hargaLaku, komisiReseller, labaOwner, conn);
            // PISAH DUIT OTOMATIS 
            // Ambil nilai modal barangnya untuk dikembalikan ke dompet MODAL
            BigDecimal modalBarang = m.getHargaModal();
            arusKasDAO.catat(conn, "MASUK", "MODAL", modalBarang, "Modal balik dari penjualan: " + m.getNama());

            // Masukkan keuntungan bersih owner ke dompet PROFIT
            arusKasDAO.catat(conn, "MASUK", "PROFIT", labaOwner, "Laba owner dari penjualan: " + m.getNama());

            conn.commit(); 
            } catch(SQLException e){
                try { 
                    conn.rollback(); 
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
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
    public void editBarang(int id, String nama, BigDecimal hargaModal, BigDecimal hargaJual) throws Exception{
        Mainan m = mainanDAO.cariBarang(id);
        if (m == null) throw new Exception("Barang dengan ID: " + id + "tidak ditemuka!!");

        m.setNama(nama);
        m.setHargaModal(hargaModal);
        m.setHargaPerkiraanJual(hargaJual);

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
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
        // 1. Cari barangnya dulu
        Mainan m = mainanDAO.cariBarang(idBarang);
        if (m == null) throw new Exception("Barang tidak ditemukan!");
        if (m.getStok() < jumlah) throw new Exception("Stok tidak mencukupi untuk dibooking!");

        // 2. Parsing tanggal dari String (HTML input) ke LocalDate
        LocalDate deadline = LocalDate.parse(tglJanji); 
        
        // 3. Siapkan objek Booking
        Booking baru = new Booking(idBarang, namaCustomer, jumlah, deadline);

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false); // Mulai Transaksi
            try {
                // A. Kurangi stok barang di rak (biar gak dibeli orang lain)
                m.setStok(m.getStok() - jumlah);
                mainanDAO.updateBarang(m, conn);

                // B. Catat siapa yang booking
                mainanDAO.tambahBooking(baru, conn);

                conn.commit();
                System.out.println("Booking Berhasil! Barang " + m.getNama() + " sudah diamankan.");
            } catch (Exception e) {
                conn.rollback();
                throw new Exception("Gagal proses booking: " + e.getMessage());
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
                Booking bk = mainanDAO.getBookingById(bookingId);
                if (bk == null) throw new Exception("Data booking tidak ditemukan!");

                Mainan m = mainanDAO.cariBarang(bk.getBarangId());
                if (m == null) throw new Exception("Data Barang asal tidak ditemukan");

                BigDecimal profitKotor = FinanceCalculator.hitungProfitKotor(hargaLaku, m.getHargaModal(), bk.getJumlah());
                BigDecimal komisi = FinanceCalculator.hitungKomisi(profitKotor);
                BigDecimal profitOwner = FinanceCalculator.hitungNetProfit(profitKotor, komisi);

                mainanDAO.catatTransaksi(m, bk.getJumlah(), hargaLaku, komisi, profitOwner, conn);

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
                // ============================================================================
                conn.commit();
            } catch (Exception e) {
                conn.rollback();
                System.err.println("Transaksi Gagal, Rollback" + e.getMessage());
                throw e;
            }
        }
    }
    public BigDecimal getDanaSiapBelanja() throws Exception {
        try (Connection conn = DatabaseConnection.getConnection()) {
            // Ambil semua mutasi uang masuk dan keluar di dompet MODAL
            BigDecimal totalMasuk = arusKasDAO.getTotalDana(conn, "MASUK", "MODAL");
            BigDecimal totalKeluar = arusKasDAO.getTotalDana(conn, "KELUAR", "MODAL");
            
            // Rumus sisa dana: Duit modal yang balik dikurangi duit modal yang udah dibelanjain lagi
            return totalMasuk.subtract(totalKeluar);
        } catch (SQLException e) {
            throw new Exception("Gagal menghitung dana siap belanja: " + e.getMessage());
        }
    }
}

