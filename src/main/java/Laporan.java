import java.math.BigDecimal;

public class Laporan {
    private BigDecimal omset;
    private BigDecimal komisi;
    private BigDecimal profit;
    private String periode;
    public Laporan(BigDecimal omset, BigDecimal komisi, BigDecimal profit, String periode){
        this.omset = omset;
        this.komisi = komisi;
        this.profit = profit;
        this.periode = periode;
    }
    public BigDecimal getOmset(){return omset;}
    public BigDecimal getKomisi(){return komisi;}
    public BigDecimal getProfit(){return profit;}

    public void setOmset(BigDecimal omset){
        this.omset = omset;
    }
    public void setKomisi(BigDecimal komisi){
        this.komisi = komisi;
    }
    public void setProfit(BigDecimal profit){
        this.profit = profit;
    }
    public void setPeriod(String masa){
        this.periode = masa;
    }
    public String getPeriod(){
        return periode;
    }

}
