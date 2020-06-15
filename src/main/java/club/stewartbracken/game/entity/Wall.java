package club.stewartbracken.game.entity;

import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.Entity;
import club.stewartbracken.game.Physics;
import processing.core.PVector;

public class Wall
    implements Entity {
//    PVector pos;

    private final Physics physics;
    private static final int SPEED = 800;//px/s
    final String id;
    public Wall(PVector pos) {
        this.id=IdUtils.newId();
//        this.pos = pos;
        this.physics=new Physics(pos);
    }

    public void move(Context ctx, PVector direction){
//        this.physics.getPos()
        this.physics.setPos(this.physics.getPos().add(direction.mult(ctx.dt()).mult(SPEED)));
//        this.pos;
    }

    @Override
    public void draw(Context ctx) {
        ctx.app().rectMode(ctx.app().CENTER);
        ctx.app().fill(200,60,150);
        ctx.app().stroke(30);
        ctx.app().rect(this.physics.getPos().x, this.physics.getPos().y, 40,40 );
    }

    @Override
    public Physics getPhysics() {
        return this.physics;
    }

    @Override
    public void update(Context ctx) {

    }

    @Override
    public String getId() {
        return this.id;
    }
}
