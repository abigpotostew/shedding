package club.stewartbracken.game;

import processing.core.PVector;

public class Physics {
    public static int NO_COLLISION=0;
    public static int WALL=0;

    private final PVector pos;
    private final Collision collision;

    public Physics(PVector pos) {
        this(pos,Collision.DEFAULT);
    }

    public Physics(PVector pos, Collision collision){
        this.pos=pos;
        this.collision=collision;
    }

    public PVector getPos() {
        return pos.copy();
    }
    public void setPos(PVector pos){
        this.pos.set(pos);
    }


}
