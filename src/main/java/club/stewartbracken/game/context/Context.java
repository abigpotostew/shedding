package club.stewartbracken.game.context;

import processing.core.PApplet;

public interface Context {
    PApplet app();

    float dt();

    //seconds
    float gameTime();
}
