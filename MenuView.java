import java.math.BigDecimal;
import java.util.Scanner;
import java.util.List;

public class MenuView {
    private Scanner sc = new Scanner(System.in);
    private GudangService service = GudangService.getInstance();
    private boolean running = true;

    public void displayMenu(){
        while (running) {
            System.out.println("Menu HW DATA");
            System.out.println("1. Owner Only");
            System.out.println("2. Lapor Penjualan(Reseller)");
            System.out.println("3. Keluar");
            System.out.print("Pilih : ");

            String choice = sc.nextLine();
            switch (choice) {
                case "1" -> handleOwnerLogin();
                case "2" -> handleResellerMenu();
                case "3" -> {
                    System.out.println("Terima Kasih");
                    running = false;
                }
                default -> 
                    System.out.println("Pilihan Salah");
            }
        }
    }

    public void handleOwnerLogin(){
        System.out.println("User : "); String user = sc.nextLine();
        System.out.println("Password : "); String password = sc.nextLine();

        if (service.authenticate(user, password)) {
            System.out.println("Login Berhasil");
            showOwnerMenu();
        }else{
            System.err.println("Login gagal");
        }
    }
    public void showOwnerMenu(){
        boolean back = false;
        while (!back) {
            sc.nextLine();
            System.out.println("Menu Owner");
            System.out.println("1. Input Barang Masuk");
            System.out.println("2. Menu Laporan Keuangan");
            System.out.println("3. Katalog Barang");
            System.out.println("4. Laporan Keuangan Bulanan");
            System.out.println("5. Keluar");
            System.out.print("Pilih : ");

            String choice = sc.nextLine();
            switch (choice) {
                case "1"-> handleInputBarang();
                case "2"-> handleMenuLaporan();
                case "3"-> service.lihatDaftarBarangOwner();
                case "4"-> handleLaporanBulanan();
                case "5"-> back = true;
                default -> System.out.println("Pilihan Salah");
            }
        }
    }
    public void handleInputBarang(){
        try {
            System.out.println("INPUT BARANG MASUK");
            System.out.println("Nama Barang");
            String namaBarang = sc.nextLine();
            System.out.println("Harga Modal");
            BigDecimal hargaModal = new BigDecimal(sc.nextLine());
            System.out.println("Harga Jual");
            BigDecimal hargaJual = new BigDecimal(sc.nextLine());
            System.out.println("Jumlah Stock");
            int stok = Integer.parseInt(sc.nextLine());

             Mainan mainanBaru = new Mainan(namaBarang, hargaModal, hargaJual, stok);
             //gw tambah barang
            
            String hasil = service.simpanMainan(mainanBaru);
            System.out.println(hasil);
            System.out.println("Barang berhasil diInput");      
        } catch (Exception e) {
            System.err.println("Gagal diINPUT" + e.getMessage());
        }
    }
    public void handleResellerMenu(){
        System.out.println("\n Menu Laporan Penjualan");

        List<MainanReseller> list = service.lihatDaftarBarangReseller();
        if (list.isEmpty()) {
            System.out.println("Stok kosong");
        }else{
            System.out.printf("%-4s | %-18s | %-6s | Rp%-12s\n", 
                            "ID", "Nama Barang", "Stok", "Estimasi Jual");
        }
        for (MainanReseller m : list) {
            System.out.printf("%-4s | %-18s | %-6s | Rp%-11s\n", 
                            m.getId(), m.getNama(), m.getStok(), m.getHargaPerkiraanjual());
        }

        try {
            System.out.println("Masukan ID Barang"); 
            int idBarang = Integer.parseInt(sc.nextLine());
             System.out.println("Terjual dengan harga : ");
            BigDecimal hargaLaku = new BigDecimal(sc.nextLine());

            service.prosesPenjualan(idBarang, hargaLaku);
        } catch (GudangException e) {
            System.err.println("ERROR" + e.getMessage());
        }catch( Exception e){
            System.err.println("ERROR TAK TERDUGA: " + e.getMessage());
        }
    }
    public void handleLaporanBulanan(){
        System.out.print("Masukan Bulan(1-12): ");
        int bulan = Integer.parseInt(sc.nextLine());
        System.out.print("Masukan Tahun (contoh : 2026): ");
        int tahun = Integer.parseInt(sc.nextLine());

        service.cetakLaporanBulanan(bulan, tahun);
    }
    public void handleMenuLaporan(){
        System.out.println("MENU LAPORAN");
        System.out.println("1. Semua Periode");
        System.out.println("2. Filter Bulan & Tahun");
        System.out.print("Pilih: ");
        String choice = sc.nextLine();
        switch (choice) {
            case "1"-> handleLaporSemua();
            case "2"-> handlerLaporanFilter();        
            default-> System.out.println("Pilihan Salah!!");
        }
    }
    public void handleLaporSemua(){
        Laporan lap = service.cetakLaporanOwner(null, null);
        tampilkanLaporan(lap);
    }
    public void handlerLaporanFilter(){
        try {
            System.out.print("Masukan Bulan (1-12): "); int bulan = Integer.parseInt(sc.nextLine());
            System.out.print("Masukan Tahun(2026): "); int tahun = Integer.parseInt(sc.nextLine());
            Laporan lap = service.cetakLaporanOwner(bulan, tahun);
            tampilkanLaporan(lap);
    
        } catch (NumberFormatException e) {
            System.err.println("Input Angka!!!");
        }
    }
    public void tampilkanLaporan(Laporan lap){
        if (lap == null) {
            System.out.println("Data Laporan tidak ada");
            return;
        }
        System.out.println("Laporan Keuangan - " + lap.getPeriod());
        System.out.printf(" Total Omset    : Rp%,15.0f\n", lap.getOmset());
        System.out.printf(" Total Komisi    : Rp%,15.0f\n", lap.getOmset());
        System.out.printf(" Net Profit    : Rp%,15.0f\n", lap.getOmset());
    }

}
