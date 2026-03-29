import java.sql.*;
import java.math.BigDecimal;
public class MainanDAO {

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
                return m;
            }
        } catch (SQLException e) {e.printStackTrace();}
        return null;
    }
    public void updateBarang(Mainan barang, Connection conn){
        String sql ="UPDATE barang SET stok = ? WHERE id = ? ";

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
        String sql ="INSERT INTO transaksi(barang_id, jumlah , harga_jual, komisi_reseller, net_profit_owner) " +
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
