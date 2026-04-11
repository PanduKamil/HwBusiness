import java.sql.*;
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;
public class MainanDAO {

    public void tambahMainan(Mainan barang, Connection conn){
        String sql = "INSERT INTO barang(nama_barang, harga_modal_avg, harga_jual_perkiraan, stok) " +
                    "VALUES(?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
                pstmt.setString(1, barang.getNama());
                pstmt.setBigDecimal(2, barang.getHargaModal());
                pstmt.setBigDecimal(3, barang.getHargaPerkiraanJual());
                pstmt.setInt(4, barang.getStok());

                pstmt.executeUpdate();

                System.out.println("Barang Berhasil ditambahkan");
        } catch (SQLException e) {
            throw new RuntimeException("Gagal di tambahkan ke database" + e.getMessage());
        }
    }
    public Mainan cariBarang(int idCari){
        String sql = "SELECT * FROM barang WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, idCari);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {

                Mainan m = new Mainan(
                    rs.getString("nama_barang"),
                    rs.getBigDecimal("harga_modal_avg"),
                    rs.getBigDecimal("harga_jual_perkiraan"),
                    rs.getInt("stok")
                );
                m.setId(rs.getInt("id"));
                return m;
            }
        } catch (SQLException e) {e.printStackTrace();}
        return null;
    }
    public void updateBarang(Mainan barang, Connection conn){
        String sql ="UPDATE barang SET nama_barang = ?, stok = ?, harga_modal_avg = ?, harga_jual_perkiraan = ? WHERE id = ? ";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, barang.getNama());
            pstmt.setInt(2, barang.getStok());
            pstmt.setBigDecimal(3, barang.getHargaModal());
            pstmt.setBigDecimal(4, barang.getHargaPerkiraanJual());
            pstmt.setInt(5, barang.getId());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Gagal di tambahkan ke database" + e.getMessage());
        }
    }
    // public void catatPenjualan(){   }
    public void catatTransaksi(Mainan barang, int jumlah, BigDecimal jual, BigDecimal komisi, BigDecimal labaOwner, Connection conn){
        String sql ="INSERT INTO transaksi(barang_id, jumlah , harga_jual, komisi_reseller, net_profit_owner) " +
                    "VALUES(?, ?, ?, ?, ? )";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, barang.getId());
            pstmt.setInt(2, barang.getStok());
            pstmt.setBigDecimal(3, jual);
            pstmt.setBigDecimal(4, komisi);
            pstmt.setBigDecimal(5, labaOwner);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Gagal dicatat ke database" + e.getMessage());
        }
    }
    public Laporan getLaporanKeuangan(Integer bulan, Integer tahun){
        String sql = "SELECT COALESCE(SUM(harga_jual), 0) as total_omset, " +
                        "COALESCE(SUM(komisi_reseller), 0) as total_komisi, " +
                        "COALESCE(SUM(net_profit_owner), 0) as total_bersih " +
                        "FROM transaksi WHERE 1=1";
                if (bulan != null && tahun != null) {
                    sql += " AND MONTH(tanggal_jual) = ? AND YEAR(tanggal_jual) = ? ";
                }
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                    )
                {
                    if (bulan != null && tahun != null) {
                        pstmt.setInt(1, bulan);
                        pstmt.setInt(2, tahun);
                    }
                    try (ResultSet rs = pstmt.executeQuery()) {
                        if (rs.next()) {
                            String label = (bulan == null) ? "SEMUA PERIODE " : bulan + "/" + tahun; 
                        return new Laporan(
                            rs.getBigDecimal("total_omset"),
                            rs.getBigDecimal("total_komisi"),
                            rs.getBigDecimal("total_bersih"),
                            label
                            );
                        }
                    } 
        } catch (SQLException e) {
            throw new RuntimeException("Gagal Tarik laporan :" + e.getMessage());
        }
        return null;
    }
    public List<Mainan> getKatalogOwner(){
        List<Mainan> daftar = new ArrayList<>();
        String sql = "SELECT * FROM barang WHERE stok > 0";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                    ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                Mainan m = new Mainan(
                rs.getString("nama_barang"),
                rs.getBigDecimal("harga_modal_avg"),
                rs.getBigDecimal("harga_jual_perkiraan"),
                rs.getInt("stok")
            );
            m.setId(rs.getInt("id"));
            daftar.add(m);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Gagal memuat Katalog" + e.getMessage());
        }
        return daftar;
    }
    public List<MainanReseller> getKatalogReseller(){
        List<MainanReseller> daftar = new ArrayList<>();
        String sql = "SELECT id, nama_barang, stok, harga_jual_perkiraan FROM barang WHERE stok > 0";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                    ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                MainanReseller m = new MainanReseller(
                    rs.getString("nama_barang"), 
                    rs.getBigDecimal("harga_jual_perkiraan"), 
                    rs.getInt("stok"));

                    m.setId(rs.getInt("id"));
                    daftar.add(m);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Gagal memuat Katalog" + e.getMessage());
        }
        return daftar;
    }
    public Mainan cariBarangAccordingName(String namaCari){
        String sql = "SELECT * FROM barang WHERE LOWER(nama_barang) = LOWER(?)";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, namaCari);
                    ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Mainan m = new Mainan(
                    rs.getString("nama_barang"),
                    rs.getBigDecimal("harga_modal_avg"),
                    rs.getBigDecimal("harga_jual_perkiraan"),
                    rs.getInt("stok"));
                m.setId(rs.getInt("id"));
                return m;
            }
        } catch (SQLException e) {e.printStackTrace();}
    return null;
    }
    public Laporan getLaporanBulanan(int bulan, int tahun){
        String sql = "SELECT COALESCE(SUM(harga_jual), 0) as total_omset, " +
                        "COALESCE(SUM(komisi_reseller), 0) as total_komisi, " +
                        "COALESCE(SUM(net_profit_owner), 0) as total_bersih " +
                        "FROM transaksi " + 
                        "WHERE MONTH(tanggal_jual) = ? AND YEAR(tanggal_jual) = ?" ;
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setInt(1, bulan);
                    pstmt.setInt(2, tahun);
                    
                        try (ResultSet rs = pstmt.executeQuery();) {
                            if (rs.next()) {
                            return new Laporan(
                            rs.getBigDecimal("total_omset"), 
                            rs.getBigDecimal("total_komisi"), 
                            rs.getBigDecimal("total_bersih"),
                            bulan + "/" + tahun);
                            }
                        } 
        } catch (SQLException e) {
            throw new RuntimeException("Gagal tarik laporan bulanan: " + e.getMessage());
        }
       return null;                 
    }
    public void deleteTransaksi(Connection conn, int idTransaksi) throws SQLException {
    String sqlGetBarangId = "SELECT barang_id FROM transaksi WHERE id = ?";
    String sqlDelete = "DELETE FROM transaksi WHERE id = ?";
    String sqlUpdateStok = "UPDATE barang SET stok = stok + 1 WHERE id = ?";

    int idBarang = 0;

    // 1. Ambil ID Barang (Pake koneksi yang dikirim dari Service)
    try (PreparedStatement pstmtGet = conn.prepareStatement(sqlGetBarangId)) {
        pstmtGet.setInt(1, idTransaksi);
        ResultSet rs = pstmtGet.executeQuery();
        if (rs.next()) {
            idBarang = rs.getInt("barang_id");
        } else {
            throw new SQLException("Transaksi tidak ditemukan");
        }
    }

    // 2. Hapus Transaksi
    try (PreparedStatement pstmtDelete = conn.prepareStatement(sqlDelete)) {
        pstmtDelete.setInt(1, idTransaksi);
        pstmtDelete.executeUpdate();
    }

    // 3. Update stok barang (Pake idBarang, bukan idTransaksi!)
    try (PreparedStatement pstmtUpdate = conn.prepareStatement(sqlUpdateStok)) {
        pstmtUpdate.setInt(1, idBarang); 
        pstmtUpdate.executeUpdate();
    }
}
}
