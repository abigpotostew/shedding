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
import java.util.Iterator;
import java.util.List;
import java.util.function.Consumer;

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

    private GameState state;
    private GameState prevState;

    private List<Animation> blockingAnimations;

    public Game(final PApplet applet, final GameConfig config) {
        this.applet = applet;
        this.config = config;
        this.state = GameState.IDLE;
        this.prevState = GameState.IDLE;
        init();
    }

    private void init() {
        this.player = EFactory.createPlayer(new PVector(this.applet.width / 2 - 100, this.applet.height / 2, 0));
        this.other = EFactory.createOther(new PVector(this.applet.width / 2 + 100, this.applet.height / 2, 0));
        this.grid = new Grid(new PVector(0, 50), this.config.getCellCountX(), this.config.getCellCountY(), this.applet);
        this.grid.setEntity(this.config.getCellCountX() / 2 - 1, this.config.getCellCountY() / 2, this.player);
        this.grid.setEntity(this.config.getCellCountX() / 2 + 1, this.config.getCellCountY() / 2, this.other);

        this.walls = this.grid.initWalls(this.applet);

        this.pickupImageNames = AssetManager.pickupImageNames();
        Collections.shuffle(this.pickupImageNames);
        this.pickups = new ArrayList<>();
        addPickup(this.applet);

        this.blockingAnimations = new ArrayList<>();
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
        if (this.blockingAnimations.size() > 0) {
            this.state = GameState.ANIMATING;
        }
        else {
            this.state = GameState.IDLE;
        }

        if (this.state == GameState.ANIMATING) {
            final Iterator<Animation> iter = this.blockingAnimations.iterator();
            while (iter.hasNext()) {
                final Animation a = iter.next();
                if (a.step(ctx)) {
                    iter.remove();
                }
            }
        }

        if (this.state == GameState.IDLE && !ap().keyPressed && this.priorKeyPressed) {
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
                final PVector moveDir = dir;
                if (this.grid.canMove(moveDir, this.player)) {
                    // get end world position before moving the player so it doesn't double animate.
                    final PVector endPos = this.grid.worldPosOffset(this.player, moveDir);
                    this.grid.moveEntityCell(moveDir, this.player);
                    lerp(ctx, this.player, this.player.getPhysics().getPos(),
                        endPos, 0.25f, (e) -> {
                        });

                }
                final PVector mirroredDir = moveDir.copy().mult(-1);
//                if (this.grid.canMove(mirroredDir, this.other)) {
//                    this.grid.moveEntityCell(mirroredDir, this.other);
//                }
                if (this.grid.canMove(mirroredDir, this.other)) {
                    // get end world position before moving the player so it doesn't double animate.
                    final PVector endPos = this.grid.worldPosOffset(this.other, mirroredDir);
                    this.grid.moveEntityCell(mirroredDir, this.other);
                    lerp(ctx, this.other, this.other.getPhysics().getPos(),
                        endPos, 0.25f, (e) -> {
                        });

                }
                if (this.pickupStyle.equals(this.pickupStyleNeighbor)) {
                    pickupNeighbors(ctx);

                }

            }
            if (this.gameStepCounter == this.nextPickupGametime) {
                addPickup(ctx.app());
            }
            ++this.gameStepCounter;
        }
        this.priorKeyPressed = ap().keyPressed;
        this.prevState = this.state;
    }

    private void lerp(final Context ctx,
                      final Entity e,
                      final PVector start,
                      final PVector end,
                      final float duration,
                      final Consumer<Entity> onComplete) {
        final float startTime = ctx.gameTime();
        this.blockingAnimations.add(ctx1 -> {
            float amount = (ctx1.gameTime() - startTime) / duration;
            if (amount > 1f) {
                amount = 1f;
            }
            final PVector pos = PVector.lerp(start, end, amount);
            e.getPhysics().setPos(pos);
            final boolean done = amount >= 1f;
            if (done) {
                onComplete.accept(e);
            }
            return done;
        });
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

        ap().text(String.format("%.4f", ctx.dt()), ap().width - 25, 10);

        ap().text(String.format("%d", this.nextPickupGametime - this.gameStepCounter), 10, 10);
    }

    private void drawEntity(final Context ctx, final Entity e) {
        e.getSprite().draw(ctx, e.getPhysics());
    }

    public PApplet ap() {
        return this.applet;
    }

    public Context context(final float gameTime, final float dt) {
        return new GameContext(this.applet, dt, gameTime);
    }

    private interface Animation {

        boolean step(Context ctx);
    }
}
