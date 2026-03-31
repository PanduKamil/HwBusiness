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


            BigDecimal profitKotor = hargaLaku.subtract(m.getHargaModal());
            BigDecimal komisiReseller = profitKotor.multiply(new BigDecimal("0.4"));
            BigDecimal labaOwner = profitKotor.subtract(komisiReseller);

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
    public void simpanMainan(Mainan barangBaru){
        mainanDAO.tambahMainan(barangBaru);
    }  
    public void lihatDaftarBarang(){
        mainanDAO.tampilkanKatalog();
    }
    public void cetakLaporanOwner(){
        mainanDAO.pullLaporanKeuangan();
    }
}

