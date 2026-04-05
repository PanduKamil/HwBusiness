import io.javalin.Javalin;
import java.math.BigDecimal;

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
        }).start(7070);
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

        System.out.println("Server nyalai di http://localhost:7070");

        // MenuView ui = new MenuView();
        // ui.displayMenu();
    }
}
class LoginRequest { public String user, password; }
// Helper class untuk request body
