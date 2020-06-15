package club.stewartbracken.game.entity;

import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.Entity;
import club.stewartbracken.game.Physics;
import processing.core.PVector;

public class Pickup implements Entity {

    private final Physics physics;
final String id;
    public Pickup(final PVector pos) {
        this.physics = new Physics(pos);
        this.id=IdUtils.newId();
    }

    @Override
    public Physics getPhysics() {
        return this.physics;
    }

    @Override
    public void update(final Context ctx) {

    }

    @Override
    public void draw(final Context ctx) {
        ctx.app().fill(10,10,200);
        ctx.app().stroke(255);
        ctx.app().ellipse(this.physics.getPos().x, this.physics.getPos().y, 45,45 );
    }
    @Override
    public String getId() {
        return this.id;
    }
}
