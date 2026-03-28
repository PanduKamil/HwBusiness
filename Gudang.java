import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class Gudang {
    private List<Mainan> daftarStok = new ArrayList<>();

    public void tambahMainan(Mainan barangBaru) {
        boolean sudahAda = false;
        //Looping liat isi Gudang
      for(Mainan m : daftarStok){
        if (m.getNama().equalsIgnoreCase(barangBaru.getNama())) {
            int stokLama = m.getStok();
            int stokBaru = barangBaru.getStok();

            m.setStok(stokLama + stokBaru);
            System.out.println("[INFO] stok " + m.getNama() + " berhasil diupdate!" );
            sudahAda = true;
            break;
        }
      }
      
        if (!sudahAda) {
            daftarStok.add(barangBaru);
            System.out.println("[INFO] Barang baru berhasil ditambah!");
        }
        
    }

    public void tampilkanLaporan() {
        System.out.println("\n=== LAPORAN STOK & POTENSI CUAN ===");
        System.out.println("Nama Barang     | Info");
        System.out.println("------------------------------------");
        for (Mainan m : daftarStok) {
            System.out.println(m);
        }
    }

    public void jualBarang(String nama, int jumlahDiminta) {
        for (Mainan m : daftarStok) {
            if (m.getNama().equalsIgnoreCase(nama)) {

                int stokSekarang = m.getStok();
                if (stokSekarang >= jumlahDiminta) {

                    m.kurangiStok(jumlahDiminta);
                    System.out.println("Berhasil menjual " + jumlahDiminta + " " + nama);

                } else if (stokSekarang > 0) {
                    
                    int sisaSanggup = stokSekarang;
                    int pending = jumlahDiminta - sisaSanggup;

                    m.setStok(0);
                    System.out.println("Stok :" + nama + " hanya ada" + sisaSanggup);
                    System.out.println("Terjual " + sisaSanggup + " unit. " + pending + " unit PENDING.");
                } else {
                    System.out.println("Stok tidak cukup! " + nama);
                }
                return;
            }
        }
        System.out.println("Barang tidak ditemukan.");
    }
    public void hitungTotalAset() {
    BigDecimal totalModal = BigDecimal.ZERO;
    BigDecimal totalPotensiUntung = BigDecimal.ZERO;

    for (Mainan m : daftarStok) {
        // Modal per item * jumlah stok
        totalModal = totalModal.add(m.getHargaModal().multiply(new BigDecimal(m.getStok())));
        // Untung per unit * jumlah stok
        totalPotensiUntung = totalPotensiUntung.add(m.getProfitPerUnit().multiply(new BigDecimal(m.getStok())));
    }

    System.out.println("Total Modal Mengendap : Rp " + totalModal);
    System.out.println("Total Potensi Cuan    : Rp " + totalPotensiUntung);
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

