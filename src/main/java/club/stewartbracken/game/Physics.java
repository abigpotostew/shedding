package club.stewartbracken.game;

import processing.core.PVector;

public class Physics {
    private final PVector pos;

    public Physics(PVector pos) {
        this.pos = pos;
    }

    public PVector getPos() {
        return pos.copy();
    }
    public void setPos(PVector pos){
        this.pos.set(pos);
    }
}
