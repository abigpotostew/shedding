package club.stewartbracken.game;

import processing.core.PApplet;

public interface Context {
    PApplet app();

    float dt();
}
