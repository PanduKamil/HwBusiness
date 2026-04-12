import io.javalin.Javalin;
import java.util.List;

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
            if (service.authenticate(req.user, req.password)) {
                ctx.json(new ApiResponse(true, "Login Berhasil", null));
            } else {
                ctx.status(401).json(new ApiResponse(false, "Login Gagal", null));
            }
        });

        // --- Barang ---
        app.get("/api/barang", ctx -> {
            List<Mainan> data = service.lihatDaftarBarangOwner();
            ctx.json(new ApiResponse(true, "Data barang dimuat", data));
        });

        app.post("/api/barang", ctx -> {
            String msg = service.simpanMainan(ctx.bodyAsClass(Mainan.class));
            ctx.status(201).json(new ApiResponse(true, msg, null));
        });

        app.put("/api/barang/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Mainan data = ctx.bodyAsClass(Mainan.class);
            service.editBarang(id, data.getNama(), data.getHargaModal(), data.getHargaPerkiraanJual());
            ctx.json(new ApiResponse(true, "Update Sukses", null));
        });

        // --- Transaksi ---
        app.get("/api/transaksi", ctx -> {
            var data = service.lihatRiwayatTransaksi();
            ctx.json(new ApiResponse(true, "Data transaksi dimuat", data));
        });

        app.post("/api/transaksi/jual/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            // Gunakan Map agar simpel jika JualRequest belum fix
            java.util.Map<String, Object> body = ctx.bodyAsClass(java.util.Map.class);
            java.math.BigDecimal hargaLaku = new java.math.BigDecimal(body.get("hargaLaku").toString());
            service.prosesPenjualan(id, hargaLaku);
            ctx.json(new ApiResponse(true, "Laporan diterima", null));
        });

        app.delete("/api/transaksi/{id}", ctx -> {
            service.batalkanTransaksi(Integer.parseInt(ctx.pathParam("id")));
            ctx.json(new ApiResponse(true, "Transaksi hangus, stok balik!", null));
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

        // --- Exception Handling ---
        app.exception(Exception.class, (e, ctx) -> {
            System.err.println("🔥 Error: " + e.getMessage());
            ctx.status(500).json(new ApiResponse(false, "Server Error: " + e.getMessage(), null));
        });
    }
}