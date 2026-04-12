import io.javalin.Javalin;

public class ApiServer {
    private final GudangService service = GudangService.getInstance();

    public void start(int port) {
        Javalin app = Javalin.create(config -> {
            config.staticFiles.add("/public");
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(port);

        setupRoutes(app);
        System.out.println("🚀 Server Hot Wheels nyala di port: " + port);
    }

    private void setupRoutes(Javalin app) {
        // --- Auth ---
        app.post("/api/login", ctx -> {
            LoginRequest req = ctx.bodyAsClass(LoginRequest.class);
            if (service.authenticate(req.user, req.password)) ctx.status(200).result("Login Berhasil");
            else ctx.status(401).result("Login Gagal");
        });

        // --- Barang ---
        app.get("/api/barang", ctx -> {
        var data = service.lihatDaftarBarangOwner();
        ctx.json(new ApiResponse(true, "Data barang dimuat", data));
        });

        // --- Transaksi ---
        app.get("/api/transaksi", ctx -> {
            var data = service.lihatRiwayatTransaksi();
            ctx.json(new ApiResponse(true, "Data transaksi dimuat", data));
        });

        // --- Laporan ---
        app.get("/api/laporan/total", ctx -> {
            var hasil = service.cetakLaporanOwner(null, null);
            ctx.json(new ApiResponse(true, "Laporan total sukses", hasil));
        });

        app.get("/api/laporan/bulanan/{bulan}/{tahun}", ctx -> {
            int b = Integer.parseInt(ctx.pathParam("bulan"));
            int t = Integer.parseInt(ctx.pathParam("tahun"));
            var hasil = service.cetakLaporanBulanan(b, t);
            ctx.json(new ApiResponse(true, "Laporan bulanan sukses", hasil));
        });
        // --- Catch Excecption
        app.exception(Exception.class, (e, ctx) -> {
            // Log error di terminal biar lo tau apa yang rusak
            System.err.println("Error: " + e.getMessage());
            
        
            ctx.status(500).json(new ApiResponse(false, "Terjadi kesalahan: " + e.getMessage(), null));
        });

        
        app.exception(GudangException.class, (e, ctx) -> {
            ctx.status(400).json(new ApiResponse(false, e.getMessage(), null));
        });
    }
}