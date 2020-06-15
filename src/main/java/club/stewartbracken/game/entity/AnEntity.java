package club.stewartbracken.game.entity;

import club.stewartbracken.game.components.Physics;
import club.stewartbracken.game.components.Sprite;
import club.stewartbracken.game.entities.IdUtils;

public class AnEntity
    implements Entity {

    private final Physics physics;
    private final Sprite sprite;
    private final String id;

    public AnEntity(final Physics physics, final Sprite sprite, final String type) {
        this.physics = physics;
        this.sprite = sprite;
        this.id = String.format("%s-%s", type, IdUtils.newId());
    }

    @Override
    public Physics getPhysics() {
        return this.physics;
    }

    @Override
    public Sprite getSprite() {
        return this.sprite;
    }

    @Override
    public String getId() {
        return this.id;
    }
}
