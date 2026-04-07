import io.javalin.Javalin;
import java.math.BigDecimal;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        DatabaseConnection.setupDatabase();
        GudangService service = GudangService.getInstance();

        //port html 7070
         Javalin app = Javalin.create(config -> {
            config.staticFiles.add("/public");
            config.plugins.enableCors(cors -> {
                cors.add(it -> it.anyHost()); // Agar HTML bisa akses Java
            });
        }).start("0.0.0.0", 7070);
        // Endpoint untuk Login
        app.post("/api/login", ctx -> {
            LoginRequest req = ctx.bodyAsClass(LoginRequest.class);
            if (service.authenticate(req.user, req.password)) {
                ctx.status(200).result("Login Berhasil");
            } else {
                ctx.status(401).result("Login Gagal");
            }
        });

        // Endpoint untuk Lihat Katalog (Reseller/Owner)
        app.get("/api/barang", ctx -> {
            ctx.json(service.lihatDaftarBarangOwner());
        });

        // Endpoint untuk Input Barang (POST)
        app.post("/api/barang", ctx -> {
            Mainan baru = ctx.bodyAsClass(Mainan.class);
            String hasil = service.simpanMainan(baru);
            ctx.status(201).result(hasil);
        });

        //Endpoint untuk Lihat data laporan
        app.get("/api/laporan/total", ctx -> {
            ctx.json(service.cetakLaporanOwner(null, null));
        });

        //Endpoint untuk laporan bulanan
        app.get("/api/laporan/bulanan/{bulan}/{tahun}", ctx ->{
            int bulan = Integer.parseInt(ctx.pathParam("bulan"));
            int tahun = Integer.parseInt(ctx.pathParam("tahun"));
            ctx.json(service.cetakLaporanBulanan(bulan, tahun));
        });
        //Endpoint untuk input Laporan
        // Endpoint Jual: Ambil ID dari URL agar lebih 'RESTful' dan ringan
        app.post("/api/transaksi/jual/{id}", ctx -> {
            int idBarang = Integer.parseInt(ctx.pathParam("id"));
            // Ambil hargaLaku dari body untuk kalkulasi profit
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            BigDecimal hargaLaku = new BigDecimal(body.get("hargaLaku").toString());

            try {
                service.prosesPenjualan(idBarang, hargaLaku);
                ctx.status(200).result("Laporan diterima");
            } catch (Exception e) {
                // Safety: Kirim pesan error spesifik ke user
                ctx.status(400).result(e.getMessage());
            }
        });
        System.out.println("Server nyalai di http://localhost:7070");

        // MenuView ui = new MenuView();
        // ui.displayMenu();
        }
}
class LoginRequest { public String user, password; }
// Helper class untuk request body
