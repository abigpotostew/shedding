package club.stewartbracken.game.entity;

import club.stewartbracken.game.components.Physics;
import club.stewartbracken.game.components.Sprite;

public interface Entity {

    Physics getPhysics();

    Sprite getSprite();

    String getId();
}
