package club.stewartbracken.game.entities;

import club.stewartbracken.game.entity.Entity;

public class EntityUtils {

    public static boolean isPickup(final Entity e) {
        return e != null && e.getId().startsWith("PICKUP");
    }
}
