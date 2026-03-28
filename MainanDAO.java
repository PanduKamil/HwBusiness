import java.sql.*;
import java.sql.PreparedStatement;
public class MainanDAO {
    public void inisialisasiTable() {
        String sqlBarang ="CREATE TABLE IF NOT EXISTS barang(" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "nama_barang STRING VARCHART(30), " +
                    "harga_modal_avg DECIMAL(12,5), " +
                    "harga_jual_perkiraan DECIMAL(12,5), " +
                    "stok INT, " +
                    "status_parkir BOOLEAN DEFAULT TRUE, " +
                    "tanggal_masuk TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";

        String sqlTransaksi = "CREATE TABLE IF NOT  EXISTS transaksi(" +
                            "id INT AUTO_INCREMENT, " +
                            "barang_id STRING VARCHART(30) PRIMARY KEY, " +
                            "jumlah INT, " +
                            "harga_jual DECIMAL(12,5), " +
                            "komisi_seller DECIMAL(12,5), " +
                            "net_profit_owner DECIMAL(12,5), " +
                            "tanggal_jual TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (barang_id) REFERENCES barang(id))";
        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement();) {
                pstmt.executeQuery(sqlBarang);
                pstmt.execute(sqlTransaksi);
                System.out.println("[LOG] Tabel Nasabah & Tabel Transaksi berhasil diinisiasi");
        } catch (SQLException e) {
            System.out.println("[ERROR] gagal inisialisasi " + e.getMessage());
        }
    }
}
