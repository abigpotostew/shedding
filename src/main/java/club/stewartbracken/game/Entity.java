package club.stewartbracken.game;

public interface Entity {
    Physics getPhysics();
    void update( Context ctx  );
    void draw(Context ctx  );

}
