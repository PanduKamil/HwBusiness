import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {
    private static final String URL ="jdbc:h2:./data/mainanDB";
    private static final String USER = "dudu";
    private static final String PASSWORD = "";

    private static Connection connection;

        private DatabaseConnection(){}
        
        public static Connection getConnection() throws SQLException{
                if (connection == null || connection.isClosed()) {
                    connection = DriverManager.getConnection(URL, USER, PASSWORD);
                }
                return connection;
            }

        public static void setupDatabase() {
        String sqlBarang ="CREATE TABLE IF NOT EXISTS barang(" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "nama_barang VARCHAR(30), " +
                    "harga_modal_avg DECIMAL(12,5), " +
                    "harga_jual_perkiraan DECIMAL(12,5), " +
                    "stok INT, " +
                    "status_parkir BOOLEAN DEFAULT TRUE, " +
                    "tanggal_masuk TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";

        String sqlTransaksi = "CREATE TABLE IF NOT  EXISTS transaksi(" +
                            "id INT AUTO_INCREMENT, " +
                            "barang_id INT , " +
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
}
