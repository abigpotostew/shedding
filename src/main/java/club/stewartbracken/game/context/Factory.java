package club.stewartbracken.game.context;

import processing.core.PApplet;

public class Factory {
    public static Context newCtx(PApplet app){
        return new GameContext(app,0, 0);
    }
}
