import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;

public class Mainan {
    private String nama;
    private BigDecimal hargaModal;
    private BigDecimal hargaPerkiraanJual;
    private int stok;
    private LocalDateTime waktuInput;
    private int id;

    public Mainan(String nama, BigDecimal modal, BigDecimal jual, int stok) {
        this.nama = nama;
        this.hargaModal = modal;
        this.hargaPerkiraanJual = jual;
        this.stok = stok;
        this.waktuInput = LocalDateTime.now();
    }

    // Hitung potensi keuntungan bersih per unit
    public BigDecimal getHargaPerkiraanjual() {
        return hargaPerkiraanJual;
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
     public int setId(int id){
        return this.id;
    }
     public String getWaktuFormat(){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        return waktuInput.format(formatter);
     }
     ///ADMIN
     /// 

    @Override
    public String toString() {
        return String.format("ID: %-3d | [%s] %-15s | Stok: %-3d | Untung/Unit: Rp%,.0f", 
                id, getWaktuFormat(), nama, stok, getHargaPerkiraanjual());
    }
}

