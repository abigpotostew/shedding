package club.stewartbracken.game.entity;

import club.stewartbracken.game.components.Physics;
import club.stewartbracken.game.components.Sprite;
import club.stewartbracken.game.context.Context;

public interface Entity {
    Physics getPhysics();
//    void update( Context ctx);
//    void draw(Context ctx  );
    Sprite getSprite();

    String getId();
}
