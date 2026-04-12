import java.math.BigDecimal;

public class TransaksiDTO {
    private int id;
    private String namabarang;
    private BigDecimal hargaModal;
    private BigDecimal hargaLaku;
    private BigDecimal profit;
    private String tanggal;

    public TransaksiDTO(int id, String namaBarang, BigDecimal hargaModal, BigDecimal hargaLaku, BigDecimal profit, String tanggal){
        this.id = id;
        this.namabarang = namaBarang;
        this.hargaModal = hargaModal;
        this.hargaLaku = hargaLaku;
        this.profit = profit;
        this.tanggal = tanggal;
    }
    public int getID(){return id;}
    public String getNamaBarang(){return namabarang;}
    public BigDecimal getHargaModal(){return hargaModal;}
    public BigDecimal getHargaLaku(){return hargaLaku;}
    public BigDecimal getProfit(){return profit;}
    public String getTanggal(){return tanggal;}


}
