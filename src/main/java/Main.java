import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        //port html 7070
        var app = Javalin.create(config -> {
            config.staticFiles.add("/public");
        }).start(7070);

        //api getStok data

        app.get("/api/stok", ctx ->{ctx.result("GTR: 10, Supra: 5, Civic: 3 ");});

        System.out.println("Server nyalai di http://localhost:7070");

        DatabaseConnection.setupDatabase();
        MenuView ui = new MenuView();
        ui.displayMenu();
    }
}