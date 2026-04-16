import java.sql.*;
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;
public class MainanDAO {
    // Barang
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
    public Mainan cariBarang(int idCari, Connection conn){
        String sql = "SELECT * FROM barang WHERE id = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
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
    public Mainan cariBarang(int idCari){
        try (Connection conn = DatabaseConnection.getConnection()) {
            return cariBarang(idCari, conn);
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
    // Laporan
    public Laporan getLaporanKeuangan(Integer bulan, Integer tahun){
        String sql = "SELECT " +
                        "COALESCE(SUM(t.harga_jual), 0) as total_omset, " +
                        "COALESCE(SUM(t.komisi_reseller), 0) as total_komisi, " +
                        "COALESCE(SUM(t.net_profit_owner), 0) as total_bersih, " +
                        "COALESCE(SUM(t.jumlah * b.harga_modal_avg), 0) as total_modal " +
                        "FROM transaksi t " +
                        "LEFT JOIN barang b ON t.barang_id = b.id " +
                        "WHERE 1=1";
                if (bulan != null && tahun != null) {
                    sql += " AND MONTH(t.tanggal_jual) = ? AND YEAR(t.tanggal_jual) = ? ";
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
                            rs.getBigDecimal("total_modal"),
                            label
                            );
                        }
                    } 
        } catch (SQLException e) {
            throw new RuntimeException("Gagal Tarik laporan :" + e.getMessage());
        }
        return null;
    }
    public Laporan getLaporanBulanan(int bulan, int tahun){
        String sql = "SELECT COALESCE(SUM(t.harga_jual), 0) as total_omset, " +
                        "COALESCE(SUM(t.komisi_reseller), 0) as total_komisi, " +
                        "COALESCE(SUM(t.net_profit_owner), 0) as total_bersih, " +
                        "COALESCE(SUM(t.jumlah * b.harga_modal_avg), 0) as total_modal " +
                        "FROM transaksi t " +
                        "LEFT JOIN barang b ON t.barang_id = b.id " +
                        "WHERE MONTH(t.tanggal_jual) = ? AND YEAR(t.tanggal_jual) = ?" ;
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
                            rs.getBigDecimal("total_modal"),
                            bulan + "/" + tahun);
                            }
                        } 
        } catch (SQLException e) {
            throw new RuntimeException("Gagal tarik laporan bulanan: " + e.getMessage());
        }
       return null;                 
    }
    // Transaksi
    public void catatTransaksi(Mainan barang, int jumlah, BigDecimal jual, BigDecimal komisi, BigDecimal labaOwner, Connection conn)
    throws SQLException{
        String sql ="INSERT INTO transaksi(barang_id, jumlah , harga_jual, komisi_reseller, net_profit_owner) " +
                    "VALUES(?, ?, ?, ?, ? )";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, barang.getId());
            pstmt.setInt(2, jumlah);
            pstmt.setBigDecimal(3, jual);
            pstmt.setBigDecimal(4, komisi);
            pstmt.setBigDecimal(5, labaOwner);
            pstmt.executeUpdate();
        } 
    }
    public void deleteTransaksi(Connection conn, int idTransaksi) throws SQLException {
    // 1. Query untuk ambil data sebelum dihapus
    String sqlGetInfo = "SELECT barang_id, jumlah FROM transaksi WHERE id = ?";
    String sqlDelete = "DELETE FROM transaksi WHERE id = ?";
    String sqlUpdateStok = "UPDATE barang SET stok = stok + ? WHERE id = ?";

    int idBarang = 0;
    int jumlahTerjual = 0;

    // STEP 1: Ambil info barang & jumlah
    try (PreparedStatement pstmtGet = conn.prepareStatement(sqlGetInfo)) {
        pstmtGet.setInt(1, idTransaksi);
        try (ResultSet rs = pstmtGet.executeQuery()) {
            if (rs.next()) {
                idBarang = rs.getInt("barang_id");
                jumlahTerjual = rs.getInt("jumlah");
            } else {
                throw new SQLException("Transaksi tidak ditemukan!");
            }
        }
    }

    // STEP 2: Hapus transaksi
    try (PreparedStatement pstmtDelete = conn.prepareStatement(sqlDelete)) {
        pstmtDelete.setInt(1, idTransaksi);
        pstmtDelete.executeUpdate();
    }

    // STEP 3: Balikin stok sesuai jumlah yang tadi diambil
    try (PreparedStatement pstmtUpdate = conn.prepareStatement(sqlUpdateStok)) {
        pstmtUpdate.setInt(1, jumlahTerjual); // Pakai variabel jumlahTerjual, bukan hardcode 1
        pstmtUpdate.setInt(2, idBarang);
        pstmtUpdate.executeUpdate();
    }
}

    public List<TransaksiDTO> getAllTransaksi() {
    List<TransaksiDTO> list = new ArrayList<>();
    String sql = "SELECT t.id, b.nama_barang, b.harga_modal_avg, t.harga_jual, t.net_profit_owner, " +
                 "FORMATDATETIME(t.tanggal_jual, 'dd-MM-yyyy HH:mm') as tgl " +
                 "FROM transaksi t " +
                 "INNER JOIN barang b ON t.barang_id = b.id " +
                 "ORDER BY t.id DESC"; // Biar yang terbaru di atas

    try (Connection conn = DatabaseConnection.getConnection();
         PreparedStatement pstmt = conn.prepareStatement(sql);
         ResultSet rs = pstmt.executeQuery()) {

        while (rs.next()) {
            list.add(new TransaksiDTO(
                rs.getInt("id"),
             rs.getString("nama_barang"), 
             rs.getBigDecimal("harga_modal_avg"), 
             rs.getBigDecimal("harga_jual"), 
             rs.getBigDecimal("net_profit_owner"), 
             rs.getString("tgl")));
        }
    } catch (SQLException e) {
        throw new RuntimeException("Gagal mengambil riwayat" + e.getMessage());
    }
    return list;
}
    //Booking
    public void tambahBooking(Booking booking, Connection conn) throws SQLException {
    String sql = "INSERT INTO booking (barang_id, nama_pembooking, jumlah, batas_pembayaran) VALUES (?, ?, ?, ?)";
    
    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
        pstmt.setInt(1, booking.getBarangId());
        pstmt.setString(2, booking.getNamaPembooking());
        pstmt.setInt(3, booking.getJumlah());
        // LocalDate ke SQL Date
        pstmt.setDate(4, java.sql.Date.valueOf(booking.getBatasPembayaranStr()));
        
        pstmt.executeUpdate();
    }
}

public List<Booking> getActiveBookings() {
    List<Booking> list = new ArrayList<>();
    String sql = "SELECT bk.*, b.nama_barang FROM booking bk " +
                 "JOIN barang b ON bk.barang_id = b.id " +
                 "WHERE bk.status = 'ACTIVE'";
                 
    try (Connection conn = DatabaseConnection.getConnection();
         PreparedStatement pstmt = conn.prepareStatement(sql);
         ResultSet rs = pstmt.executeQuery()) {
         
        while (rs.next()) {
            Booking bk = new Booking(
                rs.getInt("id"),
                rs.getInt("barang_id"),
                rs.getString("nama_pembooking"),
                rs.getInt("jumlah"),
                rs.getDate("batas_pembayaran").toLocalDate(),
                rs.getString("status"),
                rs.getString("nama_barang")
            );
            list.add(bk);
        }
    } catch (SQLException e) {
        throw new RuntimeException("Gagal tarik data booking: " + e.getMessage());
    }
    return list;
}
    //Cancel booking
    public Booking getBookingById(int id, Connection conn) {
    String sql = "SELECT bk.*, b.nama_barang FROM booking bk JOIN barang b ON bk.barang_id = b.id WHERE bk.id = ?";
    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
        pstmt.setInt(1, id);
        try (ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                return new Booking(
                    rs.getInt("id"),
                    rs.getInt("barang_id"),
                    rs.getString("nama_pembooking"),
                    rs.getInt("jumlah"),
                    rs.getDate("batas_pembayaran").toLocalDate(),
                    rs.getString("status"),
                    rs.getString("nama_barang")
                );
            }
        }
    } catch (SQLException e) { e.printStackTrace(); }
    return null;
}
    public Booking getBookingById(int id) {
    try (Connection conn = DatabaseConnection.getConnection()) {
            return getBookingById(id, conn);
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

public void updateStatusBooking(int id, String status, Connection conn) throws SQLException {
    String sql = "UPDATE booking SET status = ? WHERE id = ?";
    try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
        pstmt.setString(1, status);
        pstmt.setInt(2, id);
        pstmt.executeUpdate();
    }
}
}
