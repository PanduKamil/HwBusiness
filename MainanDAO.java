import java.sql.*;
import java.math.BigDecimal;
public class MainanDAO {

    public void tambahMainan(Mainan barang, Connection conn){
        String sql = "INSERT INTO barang(nama_barang, harga_modal_avg, harga_jual_perkiraan, stok) " +
                    "VALUES(?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
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
                m.setId(rs.getInt("id"));
                return m;
            }
        } catch (SQLException e) {e.printStackTrace();}
        return null;
    }
    public void updateBarang(Mainan barang, Connection conn){
        String sql ="UPDATE barang SET stok = ?, harga_modal_avg = ?, harga_jual_perkiraan = ? WHERE id = ? ";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, barang.getStok());
            pstmt.setBigDecimal(2, barang.getHargaModal());
            pstmt.setBigDecimal(3, barang.getHargaPerkiraanjual());
            pstmt.setInt(4, barang.getId());

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
            System.out.println("Penjualan Berhasil dicatat");
        } catch (SQLException e) {
            throw new RuntimeException("Gagal dicatat ke database" + e.getMessage());
        }
    }
    public void pullLaporanKeuangan(){
        String sql = "SELECT COALESCE(SUM(harga_jual), 0) as total_omset, " +
                        "COALESCE(SUM(komisi_reseller), 0) as total_komisi, " +
                        "COALESCE(SUM(net_profit_owner), 0) as total_bersih " +
                        "FROM transaksi ";
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                    ResultSet rs = pstmt.executeQuery())
                {
                    if (rs.next()) {
                        System.out.println("Laporan keuangan");
                        System.out.println("Total omset : Rp " + rs.getBigDecimal("total_omset"));
                        System.out.println("Total komisi : Rp " + rs.getBigDecimal("total_komisi"));
                        System.out.println("Total bersih : Rp " + rs.getBigDecimal("total_bersih"));
                    }
            
        } catch (SQLException e) {
            System.err.println("Gagal Tarik laporan :" + e.getMessage());
        }
    }
    public void tampilkanKatalogOwner(){
        String sql = "SELECT * FROM barang WHERE stok > 0";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                    ResultSet rs = pstmt.executeQuery()) {
            System.out.println(" DATA HOTWHEELS");
            System.out.printf("%-4s | %-18s | %-6s | %-12s | %-12s\n", "ID", "NAMA BARANG", "STOK", "MODAL (AVG)", "EST. JUAL");

            while (rs.next()) {
                int id = rs.getInt("id");
                String nama = rs.getString("nama_barang");
                int stok = rs.getInt("stok");
                BigDecimal modal = rs.getBigDecimal("harga_modal_avg");
                BigDecimal harga = rs.getBigDecimal("harga_jual_perkiraan");

                System.out.printf("%-4s | %-18s |%-6d | Rp%,11.0f | Rp%,11.0f\n", id, nama, stok, modal, harga);
            }
        } catch (SQLException e) {
            System.err.println("Gagal memuat Katalog" + e.getMessage());
        }
    }
    public void tampilkanKatalogReseller(){
        String sql = "SELECT * FROM barang WHERE stok > 0";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                    ResultSet rs = pstmt.executeQuery()) {
            System.out.println(" DATA HOTWHEELS");
            System.out.printf("%-4s | %-18s | %-6s | %-12s\n", "ID", "NAMA BARANG", "STOK", "EST. JUAL");

            while (rs.next()) {
                int id = rs.getInt("id");
                String nama = rs.getString("nama_barang");
                int stok = rs.getInt("stok");
                BigDecimal harga = rs.getBigDecimal("harga_jual_perkiraan");

                System.out.printf("%-4s | %-18s |%-6d |Rp%,11.0f\n", id, nama, stok, harga);
            }
        } catch (SQLException e) {
            System.err.println("Gagal memuat Katalog" + e.getMessage());
        }
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
    public void pullLaporanKeuanganBulanan(int bulan, int tahun){
        String sql = "SELECT COALESCE(SUM(harga_jual), 0) as total_omset, " +
                        "COALESCE(SUM(komisi_reseller), 0) as total_komisi, " +
                        "COALESCE(SUM(net_profit_owner), 0) as total_bersih " +
                        "FROM transaksi " + 
                        "WHERE MONTH(tanggal_jual) = ? AND YEAR(tanggal_jual) = ?" ;
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setInt(1, bulan);
                    pstmt.setInt(2, tahun);

                    try (ResultSet rs = pstmt.executeQuery()) {
                        if (rs.next()) {
                            System.out.println(" LAPORAN KEUANGAN PERIODE " + bulan + " / " + tahun);
                            System.out.println("Laporan keuangan");
                            System.out.printf("Total omset : Rp%,15.0f\n", rs.getBigDecimal("total_omset"));
                            System.out.printf("Total komisi : Rp%,15.0f\n", rs.getBigDecimal("total_komisi"));
                            System.out.printf("Total bersih : Rp%,15.0f\n", rs.getBigDecimal("total_bersih"));
                        }
                    } 
        } catch (SQLException e) {
            System.err.println("Gagal tarik laporan bulanan: " + e.getMessage());
        }
                        
    }


}
