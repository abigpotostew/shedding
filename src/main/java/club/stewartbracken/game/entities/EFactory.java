package club.stewartbracken.game.entities;

import club.stewartbracken.game.asset.AssetManager;
import club.stewartbracken.game.components.Physics;
import club.stewartbracken.game.entity.AnEntity;
import club.stewartbracken.game.entity.Entity;
import processing.core.PImage;
import processing.core.PVector;

public class EFactory {
//
//    private static  EFactory SINGLETON =new EFactory();
//
//    private EFactory() {
//    }
//
//    public static EFactory get() {
//        return SINGLETON;
//    }

    public static Entity createPlayer(final PVector pos) {
        return new AnEntity(new Physics(pos), (ctx, phys) -> {
            ctx.app().fill(0, 200, 0);
            ctx.app().stroke(255);
            ctx.app().ellipse(phys.getPos().x, phys.getPos().y, 20, 20);
        }, "PLAYER");
    }

    public static Entity createOther(final PVector pos) {
        return new AnEntity(new Physics(pos), (ctx, phys) -> {
            ctx.app().fill(200, 0, 0);
            ctx.app().stroke(255);
            ctx.app().ellipse(phys.getPos().x, phys.getPos().y, 20, 20);
        }, "OTHER");
    }

    public static Entity createWall(final PVector pos) {
        return new AnEntity(new Physics(pos), (ctx, phys) -> {
            ctx.app().rectMode(ctx.app().CENTER);
            ctx.app().fill(200, 60, 150);
            ctx.app().stroke(30);
            ctx.app().rect(phys.getPos().x, phys.getPos().y, 40, 40);
        }, "WALL");
    }

    public static Entity createPickup(final PVector pos, final int maxSize, final String imageName) {
        return new AnEntity(new Physics(pos), (ctx, phys) -> {
            //            ctx.app().fill(10, 10, 200);
            //            ctx.app().stroke(255);
            //            ctx.app().ellipse(phys.getPos().x, phys.getPos().y, 45, 45);

            ctx.app().imageMode(ctx.app().CENTER);
            final PImage image = AssetManager.getImage(imageName);
            int w = image.width, h = image.height;
            if (w > maxSize || h > maxSize) {
                final float scalar;
                if (image.width >= image.height) {
                    scalar = 1f * maxSize / w;
                }
                else {
                    scalar = 1f*maxSize / h;
                }
                w *= scalar;
                h *= scalar;
            }
            ctx.app().image(image, phys.getPos().x, phys.getPos().y, w, h);
        }, "PICKUP");
    }
}
