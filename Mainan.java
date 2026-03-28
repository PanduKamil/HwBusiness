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
    private static int counter; //pake UUID

    public Mainan(String nama, BigDecimal modal, BigDecimal jual, int stok) {
        this.id = counter++;
        this.nama = nama;
        this.hargaModal = modal;
        this.hargaJual = jual;
        this.stok = stok;
        this.waktuInput = LocalDateTime.now();
    }

    // Hitung potensi keuntungan bersih per unit
    public BigDecimal getProfitPerUnit() {
        return hargaJual.subtract(hargaModal);
    }

    // Getters & Setters
    public int getId(){ return id;}
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
        return String.format("ID: %-3d | [%s] %-15s | Stok: %-3d | Untung/Unit: Rp%,.0f", 
                id, getWaktuFormat(), nama, stok, getProfitPerUnit());
    }
}

