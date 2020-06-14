package club.stewartbracken.game;

import processing.core.PVector;

public class Player implements Entity {
//    PVector pos;

    private final Physics physics;
    private static final int SPEED = 800;//px/s
    public Player(PVector pos) {
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
        ctx.app().fill(0,200,0);
        ctx.app().ellipse(this.physics.getPos().x, this.physics.getPos().y, 20,20 );
    }

    @Override
    public Physics getPhysics() {
        return this.physics;
    }

    @Override
    public void update(Context ctx) {

    }
}
