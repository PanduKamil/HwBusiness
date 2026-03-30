# HwBusiness

// Tambahkan logika perhitungan modal final
double hargaBarang = 104000;
double ongkir = 20000;
double modalFinal = hargaBarang + ongkir;

System.out.println("Peringatan: Modal per unit melonjak menjadi: " + (modalFinal / 2));

// Menambahkan barang dari hasil lelang dengan perhitungan ongkir
public void tambahBarangLelang(String nama, double hargaMenang, double ongkir, int stok) {
    double modalRiil = (hargaMenang + ongkir) / stok;
    // Harga jual otomatis diset lebih tinggi agar profit tetap terjaga
    double saranHargaJual = modalRiil * 1.4; // Ambil margin 40%
    
    this.tambahMainan(new Mainan(nama, modalRiil, saranHargaJual, stok));
    System.out.println("✅ Barang lelang " + nama + " masuk dengan modal bersih: Rp" + modalRiil);
}

import java.util.Scanner;

public class KalkulatorLelang {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.println("=== KALKULATOR ANTI-BONCOS LELANG ===");
        
        // 1. Input Data Dasar
        System.out.print("Estimasi Ongkir Total (Rp): ");
        double ongkir = input.nextDouble();
        
        System.out.print("Jumlah Barang yang Mau Diparkir/Dikirim: ");
        int jumlahBarang = input.nextInt();
        
        // Hitung beban ongkir per barang
        double bebanOngkirPerUnit = ongkir / jumlahBarang;

        System.out.println("\n--- Input Barang yang Sedang Di-bid ---");
        System.out.print("Harga Menang Lelang (Rp): ");
        double hargaLelang = input.nextDouble();
        
        System.out.print("Target Harga Jual (Rp): ");
        double targetJual = input.nextDouble();

        // 2. Perhitungan Modal Riil
        double modalRiil = hargaLelang + bebanOngkirPerUnit;
        double profitBersih = targetJual - modalRiil;
        double persentaseProfit = (profitBersih / modalRiil) * 100;

        // 3. Logika Keputusan Bisnis
        System.out.println("\n--- HASIL ANALISIS ---");
        System.out.printf("Modal Riil (Barang + Ongkir): Rp%,.0f\n", modalRiil);
        System.out.printf("Potensi Profit: Rp%,.0f (%.2f%%)\n", profitBersih, persentaseProfit);

        if (persentaseProfit < 15) {
            System.out.println("⚠️ STATUS: JANGAN BID! Terlalu mepet, risiko rugi tinggi.");
        } else if (persentaseProfit >= 15 && persentaseProfit < 30) {
            System.out.println("✅ STATUS: AMAN. Margin standar untuk perputaran uang.");
        } else {
            System.out.println("💰 STATUS: SANGAT UNTUNG! Hajar terus, ini barang 'Emas'.");
        }
        
        input.close();
    }
}
import java.math.BigDecimal;

public class PenjualanAdek {
    public BigDecimal hitungKomisi(BigDecimal profitBersih, String tipeBarang) {
        // Jika barang susah keluar (biasa), kasih komisi lebih gede biar dia semangat jualan
        if (tipeBarang.equalsIgnoreCase("BIASA")) {
            return profitBersih.multiply(new BigDecimal("0.30")); // Komisi 30% dari profit
        } else {
            return profitBersih.multiply(new BigDecimal("0.15")); // Komisi 15% untuk barang bagus (yang emang gampang laku)
        }
    }
}
import java.math.BigDecimal;
import java.math.RoundingMode;

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



main.java lama

       // 1. Input Stok Baru
        tokoSaya.tambahMainan(new Mainan( "HotWheels GTR", 25000, 35000, 10));
        tokoSaya.tambahMainan(new Mainan( "HotWheels Civic", 25000, 40000, 5));
        tokoSaya.tambahMainan(new Mainan( "Diecast 1:64", 190000, 230000, 2));

        // 2. Lihat Laporan Awal
        tokoSaya.tampilkanLaporan();

        // 3. Simulasi Penjualan (Misal laku 3 unit GTR)
        System.out.println("\n--- Melakukan Penjualan ---");
        tokoSaya.jualBarang("HotWheels GTR", 3);

        // 4. Lihat Laporan Setelah Penjualan
        tokoSaya.tampilkanLaporan();

SELECT b.nama_barang, b.stok, t.harga_jual, t.komisi_reseller FROM barang b JOIN transaksi t ON b.id = t.barang_id

TRUNCATE TABLE transaksi