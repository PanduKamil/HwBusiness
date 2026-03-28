
public class Main {
    public static void main(String[] args) {
        Gudang tokoSaya = new Gudang();

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
    }
}
