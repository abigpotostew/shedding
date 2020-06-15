package club.stewartbracken;

import club.stewartbracken.game.context.Context;
import club.stewartbracken.game.Game;
import processing.core.PApplet;
import processing.event.KeyEvent;

public class Shedding extends PApplet {

     Game game;

    private int previousDrawTime = 0;
    public void settings() {
        size(600, 600);
       this.game = new Game(this);
    }

    public void draw() {

        background(0);

        int startTime = millis();

        float dt = ((float)( startTime - this.previousDrawTime))/1000f;
//        Debug.log(String.format("%f",dt));
        Context context = game.context(dt);
        game.update(context);
        game.draw(context);
        previousDrawTime=startTime;
    }


    @Override
    public void keyReleased(final KeyEvent event) {
        if (event.getKey()=='r'){
            this.game=new Game(this);
        }
    }
}
