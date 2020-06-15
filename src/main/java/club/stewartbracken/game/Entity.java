package club.stewartbracken.game;

import club.stewartbracken.game.context.Context;

public interface Entity {
    Physics getPhysics();
    void update( Context ctx);
    void draw(Context ctx  );

    String getId();
}
