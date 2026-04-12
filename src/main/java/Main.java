public class Main {
    public static void main(String[] args) {
        DatabaseConnection.setupDatabase();
        new ApiServer().start(7070);
    }
}
