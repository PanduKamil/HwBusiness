import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class GudangService {
    private static GudangService instance;
    private MainanDAO mainanDAO = new MainanDAO();

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


            BigDecimal profitKotor = FinanceCalculator.hitungProfitKotor(hargaLaku, m.getHargaModal());
            BigDecimal komisiReseller = FinanceCalculator.hitungKomisi(profitKotor);
            BigDecimal labaOwner = FinanceCalculator.hitungNetProfit(profitKotor, komisiReseller);

        try (Connection conn = DatabaseConnection.getConnection()){
            conn.setAutoCommit(false);
            try {
            m.kurangiStok(1);
            mainanDAO.updateBarang(m, conn);
            mainanDAO.catatTransaksi(m, 1, hargaLaku, komisiReseller, labaOwner, conn);
            conn.commit(); 
            } catch(SQLException e){
                try {conn.rollback();} catch (SQLException ex) {
                }
            }
        }catch (SQLException e) {
            throw new GudangException("Gagal Memproses Transaksi: " + e.getMessage());
        }
    }
    public String simpanMainan(Mainan barangBaru)throws Exception{ //Cek Barang
        Mainan existing = mainanDAO.cariBarangAccordingName(barangBaru.getNama());
        String message = "";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
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
        System.out.println("Sip! Transaksi hangus, stok aman balik ke rak.");

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
}

