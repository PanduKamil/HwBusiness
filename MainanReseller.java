import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class MainanReseller {
    private String nama;
    private BigDecimal hargaPerkiraanJual;
    private int stok;
    private LocalDateTime waktuInput;
    private int id;

    public MainanReseller(String nama,BigDecimal jual, int stok) {
        this.nama = nama;
        this.hargaPerkiraanJual = jual;
        this.stok = stok;
        this.waktuInput = LocalDateTime.now();
    }
    public BigDecimal getHargaPerkiraanjual() {
        return hargaPerkiraanJual;
    }

    // Getters & Setters
    public int getId(){ return id;}
    public String getNama() { return nama; }
    public int getStok() { return stok; }
    public void kurangiStok(int jumlah) { this.stok -= jumlah; }
    public void setStok(int stok){
        this.stok = stok;
     }
     public void setId(int id){
        this.id = id;
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
