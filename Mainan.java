import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;

public class Mainan {
    private String nama;
    private BigDecimal hargaModal;
    private BigDecimal hargaJual;
    private int stok;
    private LocalDateTime waktuInput;
    private int id;

    public Mainan(String nama, double modal, double jual, int stok) {
        this.nama = nama;
        this.hargaModal = BigDecimal.valueOf(modal);
        this.hargaJual = BigDecimal.valueOf(jual);
        this.stok = stok;
        this.waktuInput = LocalDateTime.now();
    }

    // Hitung potensi keuntungan bersih per unit
    public BigDecimal getProfitPerUnit() {
        return hargaJual.subtract(hargaModal);
    }

    // Getters & Setters
    public String getNama() { return nama; }
    public int getStok() { return stok; }
    public void kurangiStok(int jumlah) { this.stok -= jumlah; }
    public BigDecimal getHargaModal() { return hargaModal; }
    public void setStok(int stok){
        this.stok = stok;
     }
     public String getWaktuFormat(){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        return waktuInput.format(formatter);
     }

    @Override
    public String toString() {
        return String.format("[%s] %-15s | Stok: %-3d | Untung/Unit: Rp%,.0f", 
                getWaktuFormat(), nama, stok, getProfitPerUnit());
    }
}

