import java.sql.*;
import java.math.BigDecimal;
public class MainanDAO {
    public void inisialisasiTable() {
        String sqlBarang ="CREATE TABLE IF NOT EXISTS barang(" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "nama_barang STRING VARCHAR(30), " +
                    "harga_modal_avg DECIMAL(12,5), " +
                    "harga_jual_perkiraan DECIMAL(12,5), " +
                    "stok INT, " +
                    "status_parkir BOOLEAN DEFAULT TRUE, " +
                    "tanggal_masuk TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";

        String sqlTransaksi = "CREATE TABLE IF NOT  EXISTS transaksi(" +
                            "id INT AUTO_INCREMENT, " +
                            "barang_id INT PRIMARY KEY, " +
                            "jumlah INT, " +
                            "harga_jual DECIMAL(12,5), " +
                            "komisi_seller DECIMAL(12,5), " +
                            "net_profit_owner DECIMAL(12,5), " +
                            "tanggal_jual TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (barang_id) REFERENCES barang(id))";
        try (Connection conn = DatabaseConnection.getConnection();
            Statement pstmt = conn.createStatement();) {
                pstmt.execute(sqlBarang);
                pstmt.execute(sqlTransaksi);
                System.out.println("[LOG] Tabel Nasabah & Tabel Transaksi berhasil diinisiasi");
        } catch (SQLException e) {
            System.out.println("[ERROR] gagal inisialisasi " + e.getMessage());
        }
    }
    public void tambahMainan(Mainan barang){
        String sql = "INSERT INTO barang(nama_barang, harga_modal_avg, harga_jual_perkiraan, stok) " +
                    "VALUES(?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
                pstmt.setString(1, barang.getNama());
                pstmt.setBigDecimal(2, barang.getHargaModal());
                pstmt.setBigDecimal(3, barang.getHargaPerkiraanjual());
                pstmt.setInt(4, barang.getStok());

                pstmt.executeUpdate();

                System.out.println("Barang Berhasil ditambahkan");
        } catch (SQLException e) {
            throw new RuntimeException("Gagal di tambahkan ke database" + e.getMessage());
        }
    }
    public void updateBarang(Mainan barang, Connection conn){
        String sql ="UPDATE barang SET stok = ? WHERE id_barang = ? ";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, barang.getStok());

            pstmt.executeUpdate();

            System.out.println("Stok berhasil diupdate");
        } catch (SQLException e) {
            throw new RuntimeException("Gagal di tambahkan ke database" + e.getMessage());
        }
    }
    // public void catatPenjualan(){   }
    public void catatTransaksi(Mainan barang, int jumlah, BigDecimal jual, BigDecimal komisi, BigDecimal labaOwner){
        String sql ="INSERT INTO barang(barang_id, jumlah , harga_jual, komisi_reseller, net_profit_owner) " +
                    "VALUES(?, ?, ?, ?, ? )";
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, barang.getId());
            pstmt.setInt(2, barang.getStok());
            pstmt.setBigDecimal(3, barang.getHargaPerkiraanjual());
            pstmt.setBigDecimal(4, komisi);
            pstmt.setBigDecimal(5, labaOwner);


            pstmt.executeUpdate();
            System.out.println("Penjualan Berhasil dicatat");
        } catch (SQLException e) {
            throw new RuntimeException("Gagal dicatat ke database" + e.getMessage());
        }
    }


}
