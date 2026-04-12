import java.math.BigDecimal;

public class Laporan {
    private BigDecimal omset;
    private BigDecimal komisi;
    private BigDecimal profit;
    private BigDecimal modal;
    private String periode;
    public Laporan(BigDecimal omset, BigDecimal komisi, BigDecimal profit, BigDecimal modal, String periode){
        this.omset = omset;
        this.komisi = komisi;
        this.profit = profit;
        this.modal = modal;
        this.periode = periode;
    }
    public BigDecimal getOmset(){return omset;}
    public BigDecimal getKomisi(){return komisi;}
    public BigDecimal getProfit(){return profit;}
    public BigDecimal getModal(){return modal;}
    public String getPeriode(){return periode;}
    public void setOmset(BigDecimal omset){
        this.omset = omset;
    }
    public void setKomisi(BigDecimal komisi){
        this.komisi = komisi;
    }
    public void setProfit(BigDecimal profit){
        this.profit = profit;
    }
    public void setModal(BigDecimal modal){
        this.modal = modal;
    }
    public void setPeriod(String masa){
        this.periode = masa;
    }
    

}
