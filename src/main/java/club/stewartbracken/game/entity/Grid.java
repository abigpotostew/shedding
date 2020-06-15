package club.stewartbracken.game.entity;

import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.Entity;
import club.stewartbracken.game.Physics;
import processing.core.PApplet;
import processing.core.PVector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Grid
    implements Entity {

    final int cellCount;
    final int cellSize;

    final Entity[][] grid;
    final String id;

    Map<Entity, Cell> lookup = new HashMap<>();

    public Grid(final int cellCount, final PApplet app) {
        this.cellCount = cellCount;
        this.cellSize = app.width / this.cellCount;
        this.grid = new Entity[cellCount][cellCount];
        this.id=IdUtils.newId();
    }

    @Override
    public Physics getPhysics() {
        return null;
    }

    @Override
    public void update(final Context ctx) {

    }

    @Override
    public void draw(final Context ctx) {

        for (int y = 0; y < this.grid.length; ++y) {
            for (int x = 0; x < this.grid[y].length; ++x) {
                ctx.app().rectMode(ctx.app().CENTER);
                ctx.app().stroke(200, 150, 0);
                //                ctx.app().fill(0);
                ctx.app().noFill();
                final float drawx = x * this.cellSize+cellSize/2;
                final float drawy = y * this.cellSize+cellSize/2;
                ctx.app().rect(drawx, drawy, this.cellSize, this.cellSize);
                ctx.app().ellipse(worldPos(x, y).x, worldPos(x, y).y, 2, 2);
            }
        }
    }

    public void setEntity(final int x, final int y, final Entity e) {
        removeEntity(e);

        this.grid[y][x] = e;
        e.getPhysics().setPos(worldPos(x, y));
        this.lookup.put(e, new Cell(x, y));
    }

    public void setEntityRandom(Context ctx, final Entity e){
        int attempt=0;
        do {
          int y = (int)ctx.app().random(this.grid.length);
          int x = (int)ctx.app().random(this.grid[y].length);
          if (grid[y][x] == null){
              setEntity(x,y,e);
              return;
          }
        }while(attempt++<this.cellCount*this.cellCount);
        throw new RuntimeException("can't find an empty cell");
    }

    public boolean removeEntity(final Entity e){
        if (this.lookup.containsKey(e)) {
            final Cell pos = this.lookup.get(e);
            this.grid[pos.y][pos.x] = null;
            this.lookup.remove(e);
            return true;
        }
        return false;
    }

    public PVector worldPos(final int x, final int y) {
        return new PVector(x * this.cellSize+cellSize/2, y * this.cellSize+cellSize/2);
    }

    public boolean canMove(final PVector delta, final Entity e) {
        return canMove((int) delta.x, (int) delta.y, e);
    }

    public boolean canMove(final int dx, final int dy, final Entity e) {
        final Cell pos = this.lookup.get(e);
        final int x = pos.x;
        final int y = pos.y;
        final int nx = x + dx;
        final int ny = y + dy;
        if (ny < 0 || ny >= this.grid.length) {
            return false;
        }
        if (nx < 0 || nx >= this.grid[ny].length) {
            return false;
        }

        final Entity targetEntity = this.grid[ny][nx];
        return targetEntity == null;
    }

    public void moveEntity(final int dx, final int dy, final Entity e) {
        if (!canMove(dx, dy, e)) {
            throw new RuntimeException("cannot move");
        }
        final Cell pos = this.lookup.get(e);
        setEntity(pos.x + dx, pos.y + dy, e);
    }

    public void moveEntity(final PVector delta, final Entity e) {
        moveEntity((int) delta.x, (int) delta.y, e);
    }

    public Entity collidingEntity(int dx, int dy, final Entity e){
        final Cell pos = this.lookup.get(e);
        final int x = pos.x;
        final int y = pos.y;
        final int nx = x + dx;
        final int ny = y + dy;
        return get(nx,ny);
    }

    private Entity get(int x, int y){
        if (y < 0 || y >= this.grid.length) {
            return null;
        }
        if (x < 0 || x >= this.grid[y].length) {
            return null;
        }
        return grid[y][x];
    }

    private static class Cell {

        int x, y;

        public Cell(final int x, final int y) {
            this.x = x;
            this.y = y;
        }
    }

    public List<Wall> initWalls(final PApplet app) {
        final List<Wall> walls = new ArrayList<>();
        for (int y = 0; y < this.grid.length; ++y) {
            for (int x = 0; x < this.grid[y].length; ++x) {
                if (app.random(1) > .9 && grid[y][x]==null) {
                    final Wall wall = new Wall(new PVector());
                    walls.add(wall);
                    setEntity(x, y, wall);
                }
            }
        }
        return walls;
    }

    public List<Pickup> addPickups(final Context ctx, final int count) {
        final List<Pickup> pickups = new ArrayList<>();

        for(int i=0;i<count;++i){
            final Pickup pickup = new Pickup(new PVector());
//            final int x = (int) ctx.app().random(this.cellCount);
//            final int y = (int) ctx.app().random(this.cellCount);
//            setEntity(x, y, pickup);
            setEntityRandom(ctx, pickup);
            pickups.add(pickup);
        }
        return pickups;
    }

    public List<Entity> findNeighbors(Entity e){
        if (!lookup.containsKey(e)){
            return Collections.emptyList();
        }
        List<Entity> out = new ArrayList<>();
        final Cell pos = this.lookup.get(e);
        for(int x=-1;x<=1;++x){
            for(int y=-1;y<=1;++y){
                if(x==0&&y==0){
                    continue;
                }
                Entity entity = get(x+pos.x, y+pos.y);
                if (entity!=null) {
                    out.add(entity);
                }
            }
        }
        return out;
    }

    @Override
    public String getId() {
        return "GRID"+id;
    }
}
