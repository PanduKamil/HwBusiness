import java.math.BigDecimal;

public class Laporan {
    BigDecimal omset;
    BigDecimal komisi;
    BigDecimal profit;
    public Laporan(BigDecimal omset, BigDecimal komisi, BigDecimal profit, String lapor){
        this.omset = omset;
        this.komisi = komisi;
        this.profit = profit;
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
}
