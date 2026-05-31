import java.math.BigDecimal;
public class TransaksiSnapshot {
    private String namaBarang;
    private BigDecimal modalSnapshot;
    private BigDecimal netProfitOwner;
    private BigDecimal komisiReseller;

    public TransaksiSnapshot(String namaBarang, BigDecimal modalSnapshot, 
                              BigDecimal netProfitOwner, BigDecimal komisiReseller) {
        this.namaBarang = namaBarang;
        this.modalSnapshot = modalSnapshot;
        this.netProfitOwner = netProfitOwner;
        this.komisiReseller = komisiReseller;
    }

    public String getNamaBarang() { return namaBarang; }
    public BigDecimal getModalSnapshot() { return modalSnapshot; }
    public BigDecimal getNetProfitOwner() { return netProfitOwner; }
    public BigDecimal getKomisiReseller() { return komisiReseller; }
}