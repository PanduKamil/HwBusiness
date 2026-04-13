import java.time.LocalDate;

public class Booking {
    private int id;
    private int barangId;
    private String namaPembooking;
    private int jumlah;
    private LocalDate batasPembayaran;
    private String status;
    private String namaBarang; 

    public Booking(int barangId, String namaPembooking, int jumlah, LocalDate batasPembayaran) {
        this.barangId = barangId;
        this.namaPembooking = namaPembooking;
        this.jumlah = jumlah;
        this.batasPembayaran = batasPembayaran;
    }
    public Booking(int id, int barangId, String namaPembooking, int jumlah, LocalDate batasPembayaran, String status, String namaBarang) {
        this.id = id;
        this.barangId = barangId;
        this.namaPembooking = namaPembooking;
        this.jumlah = jumlah;
        this.batasPembayaran = batasPembayaran;
        this.status = status;
        this.namaBarang = namaBarang;
    }
    public int getId(){return id;}
    public int getBarangId(){return barangId;}
    public String getNamaPembooking(){return namaPembooking;}
    public int getJumlah(){return jumlah;}
    public String getBatasPembayaranStr() {
    return batasPembayaran != null ? batasPembayaran.toString() : "";
    }
    public String getStatus(){return status;}
    public String getNamaBarang(){return namaBarang;}

    
    public void setId(int id){
        this.id = id;
    }
    public void setbarangId(int barangId){
        this.barangId = barangId;
    }
    public void setNamaPembooking(String namaPembooking){
        this.namaPembooking = namaPembooking;
    }
    public void setJumlah(int jumlah){
        this.jumlah = jumlah;
    }
    public void setBatasPembayaran(LocalDate batasPembayaran){
        this.batasPembayaran = batasPembayaran;
    }
    public void setStatus(String status){
        this.status = status;
    }
    public void setNamaBarang(String namaBarang){
        this.namaBarang = namaBarang;
    }
    
}