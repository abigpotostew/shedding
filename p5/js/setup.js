class GameConfig {

    _cellCountX = 0
    _cellCountY = 0
    _assetManager = null
    _levels = []

    constructor() {

    }

    get cellCountX() {
        return this._cellCountX;
    }

    set cellCountX(cellCountXIN) {
        this._cellCountX = Math.floor(cellCountXIN);
    }

    get cellCountY() {
        return this._cellCountY;
    }

    set cellCountY(cellCountYIN) {
        this._cellCountY = Math.floor(cellCountYIN);
    }

    get assetManager() {
        return this._assetManager;
    }

    set assetManager(value) {
        this._assetManager = value;
    }


    get levels() {
        return this._levels;
    }

    set levels(value) {
        this._levels = value;
    }
}


class Context {
    _dt = 0;
    _sketch = null;
    _gameTime = 0;

    constructor(sketch, dt, gameTime) {
        this._sketch = sketch;
        this._dt = dt
        this._gameTime = gameTime;
    }

    get sketch() {
        return this._sketch;
    }

    get dt() {
        return this._dt;
    }

    get gameTime() {
        return this._gameTime;
    }
}

class Entity {

    ePhysics = null
    eSprite = null
    eId = null;

    constructor(physics, id, sprite) {
        this.ePhysics = physics;
        this.eId = id;
        this.eSprite = sprite;
    }

    get physics() {
        return this.ePhysics;
    }

    get sprite() {
        return this.eSprite;
    }

    get id() {
        return this.eId;
    }

}

class Physics {

    _position = new p5.Vector()


    constructor(position) {
        this._position = position;
    }

    get pos() {
        return this._position.copy()
    }

    get pos() {
        return this._position.copy()
    }

    set pos(inPos) {
        this._position.set(inPos)
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
    _x = 0
    _y = 0

    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }
}

class AssetManager {
    _imageNames = ["hulk.png", "boyscouts.png", "eye.png", "fire.png",
        "happy.png", "lips.png", "molar.png", "nose.png", "rollerblade.png", "sad.png", "tent.png", "triforce.png"]
    _images = {}

    load(sketch) {
        for (var i = 0; i < this._imageNames.length; i++) {
            let imageName = this._imageNames[i]
            let imagePath = "assets/" + imageName
            this._images[imageName] = sketch.loadImage(imagePath)
            // console.log("loaded ", imagePath)
        }
    }

    getImage(name) {
        return this._images[name]
    }

    pickupImageNames() {
        return this._imageNames
    }
}

class StepUpdate {

    step(ctx, stepCounter){
    }
}