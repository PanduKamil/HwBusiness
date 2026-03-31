import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;

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
    public void prosesPenjualan(int idInput, BigDecimal hargaLaku) throws Exception{
            Mainan m = mainanDAO.cariBarang(idInput);

            //Validation
            if (m == null) throw new Exception("Barang dengan ID: " + idInput + "tidak ditemuka!!");

            if (m.getStok() <= 0) throw new Exception("Stok Barang " + m.getNama() + " Kosong");


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
                conn.rollback();
                throw new Exception("Gagal Memproses Transaksi: " + e.getMessage());
            }
        }
    }
    public String simpanMainan(Mainan barangBaru)throws Exception{ //Cek Barang
        Mainan existing = mainanDAO.cariBarangAccordingName(barangBaru.getNama());
        String message = "";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try {
                if (existing != null) {
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
    public void lihatDaftarBarang(){
        mainanDAO.tampilkanKatalog();
    }
    public void cetakLaporanOwner(){
        mainanDAO.pullLaporanKeuangan();
    }
}

