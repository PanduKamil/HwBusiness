import java.time.*;
import java.time.format.DateTimeFormatter;

public class Transaksi {
    private LocalDateTime waktuJual;
    private String barang;
    private int jumlahBarang;
    private String namaReseller;

    public Transaksi(String barang, int jumlah, String reseller){
        this.waktuJual = LocalDateTime.now();
        this.barang = barang;
        this.jumlahBarang = jumlah;
        this.namaReseller = reseller;

    }
    @Override
    public String toString(){
        return String.format("[%s] %s terjual %d unit oleh %s",
            waktuJual.format(DateTimeFormatter.ofPattern("HH:mm")), barang.getNama(), jumlahBarang,
            namaReseller);
    }
}
