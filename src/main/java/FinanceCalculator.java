import java.math.BigDecimal;
import java.math.RoundingMode;

public class FinanceCalculator {
    public static final BigDecimal PERSENTASE_KOMISI_RESELLER = new BigDecimal("0.30");
    //Kalo kinerja bagus naekin
    public static final BigDecimal PERSENTASE_KOMISI_SPECIAL = new BigDecimal("0.50");

    /**
     * Menghitung jatah buat Reseller berdasarkan Profit kotor
     */
    public static BigDecimal hitungKomisi(BigDecimal profitKotor){
        if (profitKotor.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return profitKotor.multiply(PERSENTASE_KOMISI_RESELLER).setScale(0, RoundingMode.HALF_UP);
    }
    /*
    Menghitung jatah bersih Owner */
    public static BigDecimal hitungNetProfit(BigDecimal profitKotor, BigDecimal komisi){
        return profitKotor.subtract(komisi);
    }
    /*Menghitung profit kotor (Harga Laku - Modal) */
    public static BigDecimal hitungProfitKotor(BigDecimal hargaLaku, BigDecimal modalSatuan, int jumlah){
        BigDecimal modalTotal = modalSatuan.multiply(new BigDecimal(jumlah));
        return hargaLaku.subtract(modalTotal);
    }
    /*Menhitung rata-rata modal */
    public static BigDecimal hitungRataRataModal(int stokLama, BigDecimal modalLama, int stokBaru, BigDecimal modalBaru){
        BigDecimal totalModalLama = modalLama.multiply(new BigDecimal(stokLama));
        BigDecimal totalModalBaru = modalBaru.multiply(new BigDecimal(stokBaru));

        BigDecimal totalStok = new BigDecimal(stokLama + stokBaru);

        return totalModalLama.add(totalModalBaru).divide(totalStok, 2, RoundingMode.HALF_UP);
    }
}
