package club.stewartbracken.game;

import processing.core.PApplet;
import processing.core.PVector;

public class Game {
    private static final char ACTION_LEFT = 'a';
    private static final char ACTION_RIGHT = 'd';
    private static final char ACTION_UP = 'w';
    private static final char ACTION_DOWN = 's';

    private final PApplet applet;

    Player player;
    Other other;
    Entity[][] grid;

    final int cellCount = 15;

    boolean priorKeyPressed;

    public Game(PApplet applet) {
        this.applet = applet;
        this.player = new Player(new PVector(this.applet.width / 2 - 100, this.applet.height / 2, 0));
        this.other = new Other(new PVector(this.applet.width / 2 + 100, this.applet.height / 2, 0));
    }

    public void update(Context ctx) {
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
                this.player.move(ctx, dir.copy());
                this.other.move(ctx, dir.copy().mult(-1));
            }
        }
        this.priorKeyPressed= ap().keyPressed;
    }

    public void draw(Context ctx) {
        ap().text(String.format("%.4f", ctx.dt()), 10, 10);
        this.player.draw(ctx);
        this.other.draw(ctx);

        ap().fill(255);
        PVector sub = PVector.sub(this.other.getPhysics().getPos(), this.player.getPhysics().getPos());
        sub = sub.mult(0.5f).add(this.player.getPhysics().getPos());
        ap().ellipse(sub.x, sub.y, 5, 5);
    }

    public PApplet ap() {
        return this.applet;
    }

    public Context context(float dt) {
        return new GameContext(this.applet, dt);
    }
}
