package club.stewartbracken.game.entities;

import club.stewartbracken.game.components.Physics;
import club.stewartbracken.game.components.Sprite;
import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.entity.Entity;
import processing.core.PApplet;
import processing.core.PVector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class Grid
    implements Entity {

    Physics physics;
    final int cellCountX, cellCountY;
    public final int cellSize;

    final Entity[][] grid;
    final String id;

    final Map<Entity, Cell> lookup = new HashMap<>();

    public Grid(final int cellCountX, final int cellCountY, final PApplet app) {
        this(new PVector(),cellCountX,cellCountY,app);
    }

    public Grid(PVector position, final int cellCountX, final int cellCountY, final PApplet app) {
        this.physics = new Physics(position);
        this.cellCountX = cellCountX;
        this.cellCountY = cellCountY;
        this.cellSize = app.width / this.cellCountX;
        this.grid = new Entity[cellCountY][cellCountX];
        this.id = IdUtils.newId();
    }

    @Override
    public Physics getPhysics() {
        return this.physics;
    }

    public void setEntity(final int x, final int y, final Entity e) {
        setEntityNoPos(x,y,e);
        e.getPhysics().setPos(worldPos(x, y));
    }

    public void setEntityNoPos(final int x, final int y, final Entity e) {
        removeEntity(e);

        this.grid[y][x] = e;
        this.lookup.put(e, new Cell(x, y));
    }

    public void setEntityRandom(final Context ctx, final Entity e) {
        int attempt = 0;
        do {
            final int y = (int) ctx.app().random(this.grid.length);
            final int x = (int) ctx.app().random(this.grid[y].length);
            if (this.grid[y][x] == null) {
                setEntity(x, y, e);
                return;
            }
        } while (attempt++ < this.cellCountY * this.cellCountX);
        throw new RuntimeException("can't find an empty cell");
    }

    public boolean removeEntity(final Entity e) {
        if (this.lookup.containsKey(e)) {
            final Cell pos = this.lookup.get(e);
            this.grid[pos.y][pos.x] = null;
            this.lookup.remove(e);
            return true;
        }
        return false;
    }

    public PVector worldPos(final int x, final int y) {
        return PVector.add(this.physics.getPos(),
         new PVector(x * this.cellSize + this.cellSize / 2, y * this.cellSize + this.cellSize / 2));
    }


    public PVector worldPosOffset(final Entity e, final PVector offset) {
        if (this.lookup.containsKey(e)){
            final Cell current = this.lookup.get(e);
            int targetX = current.x + (int)offset.x;
            int targetY = current.y + (int)offset.y;
            if (!validCoords(targetX,targetY)){
                throw new RuntimeException("invalid coordinates");
            }
            return worldPos(targetX,targetY);
        }
        throw new RuntimeException("invalid entity");

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

    // moves entity cell position but not world position
    public void moveEntityCell(final int dx, final int dy, final Entity e) {
        if (!canMove(dx, dy, e)) {
            throw new RuntimeException("cannot move");
        }
        final Cell pos = this.lookup.get(e);
        setEntityNoPos(pos.x + dx, pos.y + dy, e);
    }

    //moves entity but doesn't set position
    public void moveEntityCell(final PVector delta, final Entity e) {
        moveEntityCell((int) delta.x, (int) delta.y, e);
    }

    public Entity collidingEntity(final int dx, final int dy, final Entity e) {
        final Cell pos = this.lookup.get(e);
        final int x = pos.x;
        final int y = pos.y;
        final int nx = x + dx;
        final int ny = y + dy;
        return get(nx, ny);
    }

    private Entity get(final int x, final int y) {
        if (!validCoords(x, y)) {
            return null;
        }
        return this.grid[y][x];
    }

    public List<Entity> initWalls(final PApplet app) {
        final List<Entity> walls = new ArrayList<>();
        for (int y = 0; y < this.grid.length; ++y) {
            for (int x = 0; x < this.grid[y].length; ++x) {
                if (app.random(1) > .9 && this.grid[y][x] == null) {
                    final Entity wall = EFactory.createWall(new PVector());
                    walls.add(wall);
                    setEntity(x, y, wall);
                }
            }
        }
        return walls;
    }

    public Entity addPickup(final Context ctx, String image) {
//        final List<Entity> pickups = new ArrayList<>();

//        for (int i = 0; i < count; ++i) {
            final Entity pickup = EFactory.createPickup(new PVector(), this.cellSize, image);
            setEntityRandom(ctx, pickup);
//            pickup.add(pickup);
//        }
        return pickup;
    }

    public List<Entity> findNeighbors(final Entity e) {
        if (!this.lookup.containsKey(e)) {
            return Collections.emptyList();
        }
        final Cell pos = this.lookup.get(e);
        return findNeighbors(pos.x, pos.y);
    }

    public List<Entity> findNeighbors(final int startx, final int starty) {
        if (!validCoords(startx, starty)) {
            return Collections.emptyList();
        }
        final List<Entity> out = new ArrayList<>();
        for (int x = -1; x <= 1; ++x) {
            for (int y = -1; y <= 1; ++y) {
                if (x == 0 && y == 0) {
                    continue;
                }
                final Entity entity = get(x + startx, y + starty);
                if (entity != null) {
                    out.add(entity);
                }
            }
        }
        return out;
    }

    public List<Cell> neighborCells(final int startx, final int starty) {
        if (!validCoords(startx, starty)) {
            return Collections.emptyList();
        }
        final List<Cell> out = new ArrayList<>();
        for (int x = -1; x <= 1; ++x) {
            for (int y = -1; y <= 1; ++y) {
                    out.add(new Cell(x+startx,y+starty));

            }
        }
        return out;
    }

    private boolean validCoords(final int x, final int y) {
        if (y < 0 || y >= this.grid.length) {
            return false;
        }
        return x >= 0 && x < this.grid[y].length;
    }

    @Override
    public String getId() {
        return "GRID" + this.id;
    }

    @Override
    public Sprite getSprite() {
        return ((ctx, phys) -> {
            for (int y = 0; y < this.grid.length; ++y) {
                for (int x = 0; x < this.grid[y].length; ++x) {
                    ctx.app().rectMode(ctx.app().CENTER);
                    ctx.app().stroke(200, 150, 0);

                    final List<Entity> neighbors = this.findNeighbors(x, y);
                    ctx.app().noFill();

                    int countPickups = numPickups(neighbors);
                    if (countPickups>0){
                        ctx.app().fill(70 + countPickups*15,64+countPickups*13,43+countPickups*10);
                    }

                    if (EntityUtils.isPickup(get(x,y))){
                        ctx.app().fill(70,64,43);
                    }

                    final PVector pos = worldPos(x,y);

                    ctx.app().rect(pos.x, pos.y, this.cellSize, this.cellSize);
//                    ctx.app().ellipse(worldPos(x, y).x, worldPos(x, y).y, 2, 2);
                }
            }
        });
    }

    private int numPickups(final List<Entity> entities) {
        int count=0;
        for (final Entity e : entities) {
            if (e.getId().startsWith("PICKUP")) {
                ++count;
            }
        }
        return count;
    }

    public static class Cell {

        int x, y;
        int dist;

        public Cell(final int x, final int y) {
            this.x = x;
            this.y = y;
        }


        @Override
        public boolean equals(final Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            final Cell cell = (Cell) o;
            return this.x == cell.x &&
                this.y == cell.y;
        }

        @Override
        public int hashCode() {
            return Objects.hash(this.x, this.y);
        }
    }

}
