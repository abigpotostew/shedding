package club.stewartbracken.game.entity;

import club.stewartbracken.game.Context;
import club.stewartbracken.game.Entity;
import club.stewartbracken.game.Physics;

public class Grid implements Entity {

    final int cellCount;

    Entity[][] grid;

    public Grid(int cellCount) {
        this.cellCount = cellCount;
        grid = new Entity[cellCount][cellCount];
    }

    @Override
    public Physics getPhysics() {
        return null;
    }

    @Override
    public void update(Context ctx) {

    }

    @Override
    public void draw(Context ctx) {
        final int cellSize=ctx.app().width/this.cellCount;
        
    }
}
