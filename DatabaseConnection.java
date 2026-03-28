import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL ="jdbc:h2:./data/mainanDB";
    private static final String USER = "dudu";
    private static final String PASSWORD = "";

    private static Connection connection;

        private DatabaseConnection(){

            public static Connection getConnection() throws SQLException{
                if (connection == null || connection.isClosed()) {
                    connection = DriverManager.getConnection(URL, USER, PASSWORD);
                }
                return connection;
            }
        }
}
