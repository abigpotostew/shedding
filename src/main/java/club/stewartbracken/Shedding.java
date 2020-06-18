package club.stewartbracken;

import club.stewartbracken.game.Game;
import club.stewartbracken.game.GameConfig;
import club.stewartbracken.game.asset.AssetManager;
import club.stewartbracken.game.context.Context;
import processing.core.PApplet;
import processing.event.KeyEvent;

public class Shedding
    extends PApplet {

    Game game;
    GameConfig config;

    private int previousDrawTime = 0;

    public void settings() {
        size(750, 800);

        final int cellCountX = 7;
        final int cellSizeX = this.width / cellCountX;
        final GameConfig.GameConfigBuilder configBuilder = GameConfig.builder().setCellCountX(cellCountX).setCellCountY(
            this.height / cellSizeX);
        this.config = configBuilder.build();

        AssetManager.load(this);

        this.game = new Game(this, this.config);

    }

    public void draw() {

        background(0);

        final int startTime = millis();
        final float startTimeFloat = 1f*startTime/1000;

        final float dt = ((float) (startTime - this.previousDrawTime)) / 1000f;
        //        Debug.log(String.format("%f",dt));
        final Context context = this.game.context(startTimeFloat, dt);
        this.game.update(context);
        this.game.draw(context);
        this.previousDrawTime = startTime;

    }

    @Override
    public void keyReleased(final KeyEvent event) {
        if (event.getKey() == 'r') {
            this.game = new Game(this, config);
        }
    }
}
