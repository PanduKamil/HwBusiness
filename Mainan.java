import java.math.BigDecimal;

public class Mainan {
    private String nama;
    private BigDecimal hargaModal;
    private BigDecimal hargaJual;
    private int stok;

    public Mainan(String nama, double modal, double jual, int stok) {
        this.nama = nama;
        this.hargaModal = BigDecimal.valueOf(modal);
        this.hargaJual = BigDecimal.valueOf(jual);
        this.stok = stok;
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


    @Override
    public String toString() {
        return String.format("%-15s | Stok: %-3d | Untung/Unit: Rp%,.0f", 
                nama, stok, getProfitPerUnit());
    }
}

