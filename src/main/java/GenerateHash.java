
import org.mindrot.jbcrypt.BCrypt;
public class GenerateHash {
    public static void main(String[] args) {
        System.out.println(BCrypt.hashpw("Panduak27", BCrypt.gensalt(12)));
    }
} 
    

