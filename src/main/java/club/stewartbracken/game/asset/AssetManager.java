package club.stewartbracken.game.asset;

import club.stewartbracken.Debug;
import processing.core.PApplet;
import processing.core.PImage;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AssetManager {

    private static final Map<String, PImage> images = new HashMap<>();

    private static final String[] imageNames = new String[] { "hulk.png", "boyscouts.png", "eye.png", "fire.png",
        "happy.png", "lips.png", "molar.png", "nose.png", "rollerblade.png", "sad.png", "tent.png", "triforce.png" };

    public static List<String> pickupImageNames(){
        return Arrays.asList(imageNames);
    }

    public static void load(final PApplet applet) {
        Debug.log("Loading images");
        for (final String s : imageNames) {
            images.put(s, applet.loadImage(s));
            Debug.log("Loaded "+s);
        }
        Debug.log("Finished loading images");
    }

    public static PImage getImage(final String name) {
        return images.get(name);
    }

}
