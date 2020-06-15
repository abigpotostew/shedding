package club.stewartbracken.game;

public class Collision {
    public static final Collision DEFAULT=new Collision(0);
    public static final int PLAYER_GROUP=1;
    public static final int WALL_GROUP=2;
    public static final Collision PLAYER=new Collision(PLAYER_GROUP,PLAYER_GROUP, WALL_GROUP);
    public static final Collision WALL=new Collision(WALL_GROUP,PLAYER_GROUP);


    int collisionGroup;
    int collidesWith;

    public Collision(final int collisionGroup, final int... collidesWith) {
        for(int i=0;i<collidesWith.length;++i){
            this.collidesWith = this.collidesWith&collidesWith[i];
        }
        this.collisionGroup = collisionGroup;
    }
}
