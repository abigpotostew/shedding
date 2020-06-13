package club.stewartbracken.game;

import processing.core.PVector;

public class Other {
    PVector pos;

    private static final int SPEED = 800;//px/s
    public Other(PVector pos) {
        this.pos = pos;
    }

    public void move(Context ctx, PVector direction){
        this.pos.add(direction.mult(ctx.dt()).mult(SPEED));
    }

    public void draw(Context ctx) {
        ctx.app().fill(200,0,0);
        ctx.app().ellipse(this.pos.x, this.pos.y, 20,20 );
    }
}
