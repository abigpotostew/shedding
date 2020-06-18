class GameConfig {

    #cellCountX = 0
    #cellCountY = 0
    #assetManager = null

    constructor() {

    }

    get cellCountX() {
        return this.#cellCountX;
    }

    set cellCountX(cellCountXIN) {
        this.#cellCountX = Math.floor(cellCountXIN);
    }

    get cellCountY() {
        return this.#cellCountY;
    }

    set cellCountY(cellCountYIN) {
        this.#cellCountY = Math.floor(cellCountYIN);
    }

    get assetManager() {
        return this.#assetManager;
    }

    set assetManager(value) {
        this.#assetManager = value;
    }
}


class Context {
    #dt = 0;
    #sketch = null;
    #gameTime = 0;

    constructor(sketch, dt, gameTime) {
        this.#sketch = sketch;
        this.#dt = dt
        this.#gameTime = gameTime;
    }

    get sketch() {
        return this.#sketch;
    }

    get dt() {
        return this.#dt;
    }

    get gameTime() {
        return this.#gameTime;
    }
}

class Entity {

    #ePhysics = null
    #eSprite = null
    #eId = null;

    constructor(physics, id, sprite) {
        this.#ePhysics = physics;
        this.#eId = id;
        this.#eSprite = sprite;
    }

    get physics() {
        return this.#ePhysics;
    }

    get sprite() {
        return this.#eSprite;
    }

    get id() {
        return this.#eId;
    }

}

class Physics {

    #position = new p5.Vector()


    constructor(position) {
        this.#position = position;
    }

    get pos() {
        return this.#position.copy()
    }

    get pos() {
        return this.#position.copy()
    }

    set pos(inPos) {
        this.#position.set(inPos)
    }
}

class Sprite {

    draw(ctx, physics) {
    };
}

class IdUtils {
    static newId(prefix) {
        return prefix + '-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

class Cell {
    #x = 0
    #y = 0

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }
}

class AssetManager {
    #imageNames = ["hulk.png", "boyscouts.png", "eye.png", "fire.png",
        "happy.png", "lips.png", "molar.png", "nose.png", "rollerblade.png", "sad.png", "tent.png", "triforce.png"]
    #images = {}

    load(sketch) {
        for (var i = 0; i < this.#imageNames.length; i++) {
            let imageName = this.#imageNames[i]
            let imagePath = "assets/" + imageName
            this.#images[imageName] = sketch.loadImage(imagePath)
            console.log("loaded ", imagePath)
        }
    }

    getImage(name) {
        return this.#images[name]
    }

    pickupImageNames() {
        return this.#imageNames
    }
}