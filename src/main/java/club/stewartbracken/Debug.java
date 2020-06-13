package club.stewartbracken;

import java.util.Arrays;

public class Debug {
    public static void log(String...msgs){
        System.out.println(String.join("\t", Arrays.asList(msgs)));
    }
}
