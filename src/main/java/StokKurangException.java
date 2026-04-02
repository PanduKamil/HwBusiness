public class StokKurangException extends GudangException  {
     public StokKurangException(String namaBarang){

        super("Stok barang " + namaBarang + " Menipis");
    }
}
