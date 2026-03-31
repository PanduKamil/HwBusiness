public class Main {
    public static void main(String[] args) {
        DatabaseConnection.setupDatabase();
        MenuView ui = new MenuView();
        ui.displayMenu();
    }
}