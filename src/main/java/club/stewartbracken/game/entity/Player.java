package club.stewartbracken.game.entity;

import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.Entity;
import club.stewartbracken.game.Physics;
import processing.core.PVector;

public class Player implements Entity {
//    PVector pos;

    private final Physics physics;
    private static final int SPEED = 800;//px/s
    final String id;
    public Player(PVector pos) {
//        this.pos = pos;
        this.physics=new Physics(pos);
        this.id=IdUtils.newId();
    }

    public void move(Context ctx, PVector direction){
//        this.physics.getPos()
                this.physics.setPos(this.physics.getPos().add(direction.mult(ctx.dt()).mult(SPEED)));
//        this.pos;
    }

    @Override
    public void draw(Context ctx) {
        ctx.app().fill(0,200,0);
        ctx.app().stroke(255);
        ctx.app().ellipse(this.physics.getPos().x, this.physics.getPos().y, 20,20 );
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
