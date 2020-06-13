package club.stewartbracken.game;

import processing.core.PVector;

public class Player {
    PVector pos;

    private static final int SPEED = 800;//px/s
    public Player(PVector pos) {
        this.pos = pos;
    }

    public void move(Context ctx, PVector direction){
        this.pos.add(direction.mult(ctx.dt()).mult(SPEED));
    }

    public void draw(Context ctx) {
        ctx.app().fill(0,200,0);
        ctx.app().ellipse(this.pos.x, this.pos.y, 20,20 );
    }
}
