import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Gudang tokoSaya = new Gudang();

        Scanner sc = new Scanner(System.in);

        System.out.println(" Selamat Datang di HW Data");
        System.out.println(" LogIn Member :");
        String logIn = sc.nextLine();
        System.out.println(" Password :");
        String password = sc.nextLine();

        System.out.println(" MENU HW DATA ");
        System.out.println("1. Owner Only");
        System.out.println("2. Lapor penjualan");
        System.out.println("3. Laporan Keuangan");
        int run = sc.nextInt();
        sc.nextLine();

        switch (run) {
            case 1:
                // Login Owner
                System.out.println(" LogIn Owner");
                logIn = sc.nextLine();
                System.out.println(" Password : ");
                password = sc.nextLine();

                System.out.println(" Menu Owner");
                System.out.println(" 1. Input Barang Masuk");
                System.out.println(" 2. Cek barang parkiran");
                System.out.println(" 3. Lokasi barang");
                int run1 = sc.nextInt();
                sc.nextLine();

                switch (run1) {
                    case 1:
                        // Input Barang Masuk
                        break;
                    case 2:
                        // Cek barang parkiran lelang
                        break;
                    case 3:
                        // cek lokasi barang
                        break;
                    default:
                        break;
                }
                break;
            case 2:
                // Lapor Penjualan Reseller
                System.out.println(" Menu Laporan Penjualan");
                System.out.println(" 1. Input Barang Laku");
                System.out.println(" 2. Cek komisi penjualan");
                System.out.println(" 3. Booking");
                int run2 = sc.nextInt();
                sc.nextLine();
                // Cek komisi penjual
                switch (run2) {
                    case 1:
                         // Input Barang laku
                        break;
                    case 2:
                        // Cek komisi penjualan
                        break;
                    case 3:
                        //Booking
                        break;
                    default:
                        break;
                }
                
                break;
            case 3:
                //Lapor Keuangan HARUSNYA MASUK DALAM MENU OWNER GAK SIH???
                System.out.println(" Menu Laporan Keuangan");
                System.out.println(" 1. Cek Total modal mengendap");
                System.out.println(" 2. Cek profit bersih");
                System.out.println(" 3. Riwayat Transaksi");
                int run3 = sc.nextInt();
                sc.nextLine();
                switch (run3) {
                    case 1:
                        // CEK TOTAL MODAL MENGENDAP
                        break;
                    case 2:
                        // CEK TOTAL PROFIT BERSIH
                        break;
                    case 3:
                        // RIWAYAT TRANSAKSI
                    default:
                        break;
                }
            default:
                break;
        }

    }
}
