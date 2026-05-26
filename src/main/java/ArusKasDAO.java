import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ArusKasDAO {

    // Method untuk mencatat mutasi uang masuk/keluar
    // Perhatikan kita oper objek 'conn' dari Service supaya transaksinya satu kesatuan (ACID)
    public void catat(Connection conn, String tipeKas, String dompet, BigDecimal jumlah, String keterangan) throws SQLException {
        String sql = "INSERT INTO arus_kas (tipe_kas, dompet, jumlah, keterangan) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tipeKas);
            ps.setString(2, dompet);
            ps.setBigDecimal(3, jumlah);
            ps.setString(4, keterangan);
            ps.executeUpdate();
        }
    }

    // Method bantuan untuk menghitung total saldo per dompet (MASUK dikurangi KELUAR)
    public BigDecimal getTotalDana(Connection conn, String tipeKas, String dompet) throws SQLException {
        String sql = "SELECT COALESCE(SUM(jumlah), 0) FROM arus_kas WHERE tipe_kas = ? AND dompet = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tipeKas);
            ps.setString(2, dompet);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next() && rs.getBigDecimal(1) != null) {
                    return rs.getBigDecimal(1);
                }
            }
        }
        return BigDecimal.ZERO;
    }
}