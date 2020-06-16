package club.stewartbracken.game;

import club.stewartbracken.Debug;
import club.stewartbracken.game.asset.AssetManager;
import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.context.Factory;
import club.stewartbracken.game.context.GameContext;
import club.stewartbracken.game.entities.EFactory;
import club.stewartbracken.game.entities.Grid;
import club.stewartbracken.game.entity.Entity;
import processing.core.PApplet;
import processing.core.PVector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Game {

    private static final char ACTION_LEFT = 'a';
    private static final char ACTION_RIGHT = 'd';
    private static final char ACTION_UP = 'w';
    private static final char ACTION_DOWN = 's';
    final String pickupStyleCollide = "COLLIDE";
    final String pickupStyleNeighbor = "NEIGHBOR";
    final GameConfig config;
    private final PApplet applet;
    Entity player;
    Entity other;
    Grid grid;
    List<Entity> walls;
    List<Entity> pickups;
    List<String> pickupImageNames;
    String pickupStyle = this.pickupStyleNeighbor;
    int gameStepCounter = 0;
    int nextPickupGametime;
    int numPickupsRunning = 0;

    boolean priorKeyPressed;

    public Game(final PApplet applet, final GameConfig config) {
        this.applet = applet;
        this.config = config;
        init();
    }

    private void init() {
        this.player = EFactory.createPlayer(new PVector(this.applet.width / 2 - 100, this.applet.height / 2, 0));
        this.other = EFactory.createOther(new PVector(this.applet.width / 2 + 100, this.applet.height / 2, 0));
        this.grid = new Grid(new PVector(0, 50),this.config.getCellCountX(), this.config.getCellCountY(), this.applet);
        this.grid.setEntity(this.config.getCellCountX() / 2 - 1, this.config.getCellCountY() / 2, this.player);
        this.grid.setEntity(this.config.getCellCountX() / 2 + 1, this.config.getCellCountY() / 2, this.other);

        this.walls = this.grid.initWalls(this.applet);

        this.pickupImageNames = AssetManager.pickupImageNames();
        Collections.shuffle(this.pickupImageNames);
        this.pickups = new ArrayList<>();
        addPickup(this.applet);
    }

    private void addPickup(final PApplet applet) {
        ++this.numPickupsRunning;
        final String imageName = this.pickupImageNames.get(this.nextPickupGametime % this.pickupImageNames.size());
        Debug.log("addPickup: " + imageName);
        final Entity pickup = this.grid.addPickup(Factory.newCtx(applet),
            imageName);
        this.pickups.add(pickup);
        this.nextPickupGametime = this.gameStepCounter + (int) applet.random(15, 15);
    }

    public void update(final Context ctx) {
        if (!ap().keyPressed && this.priorKeyPressed) {
            PVector dir = null;
            if (ap().key == ACTION_LEFT) {
                //move left
                //                Debug.log("left");
                dir = new PVector(-1, 0);
            }
            if (ap().key == ACTION_RIGHT) {
                //                Debug.log("right");
                dir = new PVector(1, 0);
            }

            if (ap().key == ACTION_UP) {
                //                Debug.log("up");
                dir = new PVector(0, -1);
            }

            if (ap().key == ACTION_DOWN) {
                //                Debug.log("down");
                dir = new PVector(0, 1);
            }
            if (dir != null) {
                if (this.grid.canMove(dir, this.player)) {
                    this.grid.moveEntity(dir, this.player);
                }
                final PVector mirroredDir = dir.copy().mult(-1);
                if (this.grid.canMove(mirroredDir, this.other)) {
                    this.grid.moveEntity(mirroredDir, this.other);
                }
                if (this.pickupStyle.equals(this.pickupStyleNeighbor)) {
                    pickupNeighbors(ctx);

                }
                else {
                    final Entity playerCollide = this.grid.collidingEntity((int) dir.x, (int) dir.y, this.player);
                    final Entity otherCollide = this.grid.collidingEntity((int) mirroredDir.x, (int) mirroredDir.y,
                        this.player);
                    if (playerCollide == otherCollide && playerCollide.getId().startsWith("PICKUP")) {
                        Debug.log("IT'S A PICKUP");
                    }
                }

            }
            if (this.gameStepCounter == this.nextPickupGametime) {
                addPickup(ctx.app());
            }
            ++this.gameStepCounter;
        }
        this.priorKeyPressed = ap().keyPressed;
    }

    private void pickupNeighbors(final Context ctx) {
        final List<Entity> pNeighbors = this.grid.findNeighbors(this.player);
        final List<Entity> oNeighbors = this.grid.findNeighbors(this.other);
        if (pNeighbors.isEmpty() || oNeighbors.isEmpty()) {
            //done
            return;
        }
        for (final Entity pn : pNeighbors) {
            if (oNeighbors.contains(pn)) {
                if (pn.getId().startsWith("PICKUP")) {
                    this.grid.removeEntity(pn);
                    this.pickups.remove(pn);

                    //                    this.grid.setEntityRandom(ctx, pn);
                }
            }
        }
    }

    public void draw(final Context ctx) {

        //        this.grid.draw(ctx);
        drawEntity(ctx, this.grid);
        drawEntity(ctx, this.player);
        drawEntity(ctx, this.other);
        //        this.player.getSprite().draw(ctx);
        //        this.other.getSprite().draw(ctx);
        for (final Entity w : this.walls) {
            //            w.draw(ctx);
            drawEntity(ctx, w);
        }
        for (final Entity w : this.pickups) {
            drawEntity(ctx, w);
        }

        ap().fill(255);
        PVector sub = PVector.sub(this.other.getPhysics().getPos(), this.player.getPhysics().getPos());
        sub = sub.mult(0.5f).add(this.player.getPhysics().getPos());
        ap().ellipse(sub.x, sub.y, 5, 5);

        // debug stuff on top

        ap().text(String.format("%.4f", ctx.dt()), ap().width-25, 10);

        ap().text(String.format("%d", this.nextPickupGametime-this.gameStepCounter), 10, 10);
    }

    private void drawEntity(final Context ctx, final Entity e) {
        e.getSprite().draw(ctx, e.getPhysics());
    }

    public PApplet ap() {
        return this.applet;
    }

    public Context context(final float dt) {
        return new GameContext(this.applet, dt);
    }
}
