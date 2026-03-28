import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class GudangService {
    private Map<String, Mainan> mapStok = new HashMap<>();

    private static GudangService instance;
    private MainanDAO mainanDAO = new MainanDAO();

    private static synchronized GudangService getInstance(){ // INI ANEH KENAPA ERROR
        if (instance == null) {
            instance = new GudangService();
        }
        return instance;
    }
    public void simpanMainan(Mainan barangBaru){
        mainanDAO.tambahMainan(barangBaru);
    }
    public List<Transaksi> prosesPenjualan(){
        return MainanDAO.
    }
    public void tambahMainan(Mainan barangBaru) {
        String key = barangBaru.getNama().toLowerCase();

        if (mapStok.containsKey(key)) {
            Mainan existing = mapStok.get(key);
            existing.setStok(existing.getStok() + barangBaru.getStok());

            System.out.println("[INFO] Stok " + existing.getNama() + " diupdate");
        }else{
            mapStok.put(key, barangBaru);
            System.out.println("Barang Baru didaftarkan");
        }
        
    }

    public void jualBarang(String nama, int jumlahDiminta) {
        Mainan m = mapStok.get(nama.toLowerCase());

        if (m == null) {
            System.out.println("Barang is Empty");

            return;
        }

        synchronized(m){
            if (m.getStok() >= jumlahDiminta) {
                m.kurangiStok(jumlahDiminta);
                // Simpan objeck transaksi ke List<Transaksi>history
                System.out.println("Sold" + m.getNama());
            }else{
                System.out.println("Empty");
            }
        }
    }

    public void prosesSetoranAdek(String namaBarang, BigDecimal hargaJualReal, BigDecimal hargaModalAwal) {
        // 1. Hitung Profit Kotor
        BigDecimal profitKotor = hargaJualReal.subtract(hargaModalAwal);
        
        // 2. Bagi Hasil (40% buat Adek)
        BigDecimal bagianAdek = profitKotor.multiply(new BigDecimal("0.4")).setScale(0, RoundingMode.HALF_UP);
        
        // 3. Bagian Bersih Kamu (Setelah kasih adek)
        BigDecimal jatahGw = profitKotor.subtract(bagianAdek);
        
        System.out.println("=== NOTIFIKASI CUAN ===");
        System.out.println("Barang: " + namaBarang);
        System.out.println("Kasih Adek: Rp" + bagianAdek);
        System.out.println("Masuk Tabungan Bersih: Rp" + jatahGw);
    }
    public BigDecimal hitungKomisi(BigDecimal profitBersih, String tipeBarang) {
        // Jika barang susah keluar (biasa), kasih komisi lebih gede biar dia semangat jualan
        if (tipeBarang.equalsIgnoreCase("BIASA")) {
            return profitBersih.multiply(new BigDecimal("0.30")); // Komisi 30% dari profit
        } else {
            return profitBersih.multiply(new BigDecimal("0.15")); // Komisi 15% untuk barang bagus (yang emang gampang laku)
        }
    }
}

