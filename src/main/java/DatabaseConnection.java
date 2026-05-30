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

        private DatabaseConnection(){}
        
        static{
            try {
                Properties prop = new Properties();

                prop.load(new FileInputStream(".env"));

                URL = prop.getProperty("DB_URL");
                USER = prop.getProperty("DB_USER");
                PASSWORD = prop.getProperty("DB_PASS");
                prop.setProperty("prepareThreshold", "0");  // ← ini fix-nya
                prop.setProperty("preparedStatementCacheQueries", "0");
            } catch (Exception e) {
                throw new RuntimeException("File .env gagal terbaca");
            }
        }
        public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
        }

        public static void setupDatabase() {
        String sqlBarang ="CREATE TABLE IF NOT EXISTS barang(" +
                    "id SERIAL PRIMARY KEY, " +
                    "nama_barang VARCHAR(30), " +
                    "harga_modal_avg DECIMAL(12,5), " +
                    "harga_jual_perkiraan DECIMAL(12,5), " +
                    "stok INT, " +
                    "status_parkir BOOLEAN DEFAULT TRUE, " +
                    "tanggal_masuk TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";

        String sqlTransaksi = "CREATE TABLE IF NOT EXISTS transaksi(" +
                        "id SERIAL PRIMARY KEY, " +
                        "barang_id INT, " +
                        "jumlah INT, " +
                        "harga_modal_snapshot DECIMAL(12,5) NOT NULL DEFAULT 0, " +  // ← baru
                        "harga_jual_satuan DECIMAL(12,5) NOT NULL DEFAULT 0, " +     // ← baru
                        "harga_jual DECIMAL(12,5), " +
                        "komisi_reseller DECIMAL(12,5), " +
                        "net_profit_owner DECIMAL(12,5), " +
                        "tanggal_jual TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "FOREIGN KEY (barang_id) REFERENCES barang(id))";
    
        String sqlBooking = "CREATE TABLE IF NOT EXISTS booking (" +
                                "id SERIAL PRIMARY KEY, " +
                                "barang_id INT, " +
                                "nama_pembooking VARCHAR(50), " +
                                "jumlah INT DEFAULT 1, " +
                                "tanggal_booking TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                                "batas_pembayaran DATE, " + /// Tanggal dia janji bayar
                                "status VARCHAR(20) DEFAULT 'ACTIVE', " + // ACTIVE, CANCELLED, COMPLETED
                                "FOREIGN KEY (barang_id) REFERENCES barang(id)) ";
                String sqlArusKas = "CREATE TABLE IF NOT EXISTS arus_kas (" +
                                        "id_kas SERIAL PRIMARY KEY, " +
                                        "tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                                        "tipe_kas VARCHAR(10), " +      // Isinya: 'MASUK' atau 'KELUAR'
                                        "dompet VARCHAR(10), " +        // Isinya: 'MODAL' atau 'PROFIT'
                                        "jumlah DECIMAL(15,2), " +     // Supaya presisi dapet dua angka di belakang koma (senilai BigDecimal)
                                        "keterangan VARCHAR(255))";
                    String sqlUsers = "CREATE TABLE IF NOT EXISTS users (" +
                                        "id SERIAL PRIMARY KEY, " +
                                        "username VARCHAR(50) UNIQUE NOT NULL, " +
                                        "password_hash VARCHAR(255) NOT NULL)";
        try (Connection conn = DatabaseConnection.getConnection();
            Statement pstmt = conn.createStatement();) {
                pstmt.execute(sqlBarang);
                pstmt.execute(sqlTransaksi);
                pstmt.execute(sqlBooking);
                pstmt.execute(sqlArusKas);
                pstmt.execute(sqlUsers);
                System.out.println("Database Supabase PostgreSQL berhasil disinkronisasi!");
        } catch (SQLException e) { 
            System.err.println("Gagal setup database di Supabase: " + e.getMessage());
            e.printStackTrace();
        }   
    }
}