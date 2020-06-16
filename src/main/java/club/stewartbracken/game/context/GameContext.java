package club.stewartbracken.game.context;

import processing.core.PApplet;

public class GameContext implements Context {
    PApplet applet;
    float dt;
    float gameTimeSeconds;

    public GameContext(PApplet applet, float dt, float gameTimeSeconds) {
        this.applet = applet;
        this.dt=dt;
        this.gameTimeSeconds =gameTimeSeconds;
    }

    @Override
    public PApplet app() {
        return this.applet;
    }

    @Override
    public float dt() {
        return this.dt;
    }

    @Override
    public float gameTime() {
        return gameTimeSeconds;
    }
}
