import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

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
        if (!sudahAda) {
            daftarStok.add(barangBaru);
            System.out.println("[INFO] Barang baru berhasil ditambah!");
        }
        
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

    public void jualBarang(String nama, int jumlah) {
        for (Mainan m : daftarStok) {
            if (m.getNama().equalsIgnoreCase(nama)) {
                if (m.getStok() >= jumlah) {
                    m.kurangiStok(jumlah);
                    System.out.println("Berhasil menjual " + jumlah + " " + nama);
                } else {
                    System.out.println("Stok tidak cukup!");
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

}

