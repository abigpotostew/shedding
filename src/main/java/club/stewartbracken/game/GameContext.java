package club.stewartbracken.game;

import processing.core.PApplet;

public class GameContext implements Context {
    PApplet applet;
    float dt;

    public GameContext(PApplet applet, float dt) {
        this.applet = applet;
        this.dt=dt;
    }

    @Override
    public PApplet app() {
        return this.applet;
    }

    @Override
    public float dt() {
        return this.dt;
    }
}
