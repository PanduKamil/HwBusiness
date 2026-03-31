import java.math.BigDecimal;
import java.util.Scanner;

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
            System.out.println("2. Laporan Keuangan");
            System.out.println("3. Katalog Barang");
            System.out.println("4. Laporan Keuangan Bulanan");
            System.out.println("5. Keluar");
            System.out.print("Pilih : ");

            String choice = sc.nextLine();
            switch (choice) {
                case "1"-> handleInputBarang();
                case "2"-> service.cetakLaporanOwner();
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

        service.lihatDaftarBarangReseller();
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
}
