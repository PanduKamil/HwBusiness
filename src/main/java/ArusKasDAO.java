import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // Khusus untuk ngambil angka mentah MASUK/KELUAR (untuk All-Time)
public BigDecimal getRawTotal(Connection conn, String tipeKas, String dompet) throws SQLException {
    String sql = "SELECT COALESCE(SUM(jumlah), 0) FROM arus_kas WHERE tipe_kas = ? AND dompet = ?";
    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setString(1, tipeKas);
        ps.setString(2, dompet);
        try (ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getBigDecimal(1) : BigDecimal.ZERO;
        }
    }
}

// Khusus untuk saldo bersih (MASUK - KELUAR)
public BigDecimal getSaldoBersih(Connection conn, String dompet) throws SQLException {
    String sql = "SELECT (SELECT COALESCE(SUM(jumlah), 0) FROM arus_kas WHERE tipe_kas = 'MASUK' AND dompet = ?) - " +
                 "(SELECT COALESCE(SUM(jumlah), 0) FROM arus_kas WHERE tipe_kas = 'KELUAR' AND dompet = ?)";
    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setString(1, dompet);
        ps.setString(2, dompet);
        try (ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getBigDecimal(1) : BigDecimal.ZERO;
        }
    }
}
    public List<Map<String, Object>> getRiwayatMutasi(Connection conn) throws SQLException {
        String sql = "SELECT id_kas, tanggal, tipe_kas, dompet, jumlah, keterangan FROM arus_kas ORDER BY tanggal DESC";
        List<Map<String, Object>> listKas = new ArrayList<>();
        
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id_kas", rs.getInt("id_kas"));
                // Mengubah timestamp ke string agar aman dilempar ke JSON
                row.put("tanggal", rs.getTimestamp("tanggal").toString());
                row.put("tipe_kas", rs.getString("tipe_kas"));
                row.put("dompet", rs.getString("dompet"));
                row.put("jumlah", rs.getBigDecimal("jumlah"));
                row.put("keterangan", rs.getString("keterangan"));
                listKas.add(row);
            }
        }
        return listKas;
    }
}