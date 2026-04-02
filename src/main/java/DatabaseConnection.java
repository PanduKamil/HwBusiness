import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.io.FileInputStream;
import java.util.Properties;

public class DatabaseConnection {
    private static String URL;
    private static String USER;
    private static String PASSWORD;
    private static Connection connection;

        private DatabaseConnection(){}
        
        static{
            try {
                Properties prop = new Properties();

                prop.load(new FileInputStream(".env"));

                URL = prop.getProperty("DB_URL");
                USER = prop.getProperty("DB_USER");
                PASSWORD = prop.getProperty("DB_PASS");
            } catch (Exception e) {
                throw new RuntimeException("File .env gagal terbaca");
            }
        }
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
                            "komisi_reseller DECIMAL(12,5), " +
                            "net_profit_owner DECIMAL(12,5), " +
                            "tanggal_jual TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (barang_id) REFERENCES barang(id))";
        try (Connection conn = DatabaseConnection.getConnection();
            Statement pstmt = conn.createStatement();) {
                pstmt.execute(sqlBarang);
                pstmt.execute(sqlTransaksi);
        } catch (SQLException e) { e.printStackTrace();
        }
    }
}
