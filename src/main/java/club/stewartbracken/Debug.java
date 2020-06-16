package club.stewartbracken;

import java.util.Arrays;

public class Debug {
    public static enum LogLevel{
        DEBUG,
        INFO
    }
    private static LogLevel logLevel = LogLevel.INFO;
    public static void setLogLevel(LogLevel level){
        logLevel=level;
    }
    public static void debug(String...msgs){
        if(logLevel==LogLevel.DEBUG) {
            System.out.println(String.join("\t", Arrays.asList(msgs)));
        }
    }
    public static void log(String...msgs){
        if(logLevel==LogLevel.DEBUG||logLevel==LogLevel.INFO) {
            System.out.println(String.join("\t", Arrays.asList(msgs)));
        }
    }
}
