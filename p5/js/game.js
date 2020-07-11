class StepSpawner extends StepUpdate{

    _spawnRate = 0;
    _nextPickupGameTime = 0;
    _game=null;
    _numPickups=0;


    constructor(spawnRate, game) {
        super();
        this._spawnRate=spawnRate;
        this._nextPickupGameTime = spawnRate;
        this._game=game;
        this._numPickups = this._game._level.numPickedUp | 0
    }

    step(ctx, stepCounter){
        // if number of pickups has changed
        if (this._numPickups != this._game._level.numPickedUp) {
            this.reset(stepCounter)
        }
        if(stepCounter==this._nextPickupGameTime){
            //move it!
            this._game.movePickup()
            this.reset(stepCounter)
        }
    }

    reset(stepCounter){
        this._nextPickupGameTime = stepCounter+this._spawnRate;
    }
}

class Game {

    _config = null;
    _sketch = null;
    _state = Game.STATE_IDLE;
    _prevState = Game.STATE_IDLE;
    _grid = Grid;
    _player = null;
    _other = null;
    _walls = [];
    _pickups = [];
    _numPickupsRunning = 0;

    _nextPickupGameTime = 0;
    _gameStepCounter = 0;


    _blockingAnimations = []
    _addBlockingAnimations = []
    _nonBlockingAnimations = []

    _pickupImageNames = []

    _keysPressed = []


    _level = {
        stepUpdaters:[],
        winCondition:null,//object condition with evaluate func
        numPickedUp: 0,
    }


    constructor(sketch, config) {
        this._sketch = sketch
        this._config = config
        this._pickupImageNames = config.assetManager.pickupImageNames();
        this._pickups = []

        this.load(sketch)
    }

    load(sketch) {
        const loadLevels = true
        if (loadLevels) {
            this.loadLevel(0, sketch)
        } else {
            this._grid = new Grid(sketch.createVector(3, 50), this._config.cellCountX, this._config.cellCountY, sketch)
            this._player = EFactory.createPlayer(sketch.createVector(sketch.width / 2 - 100, sketch.height / 2))
            this._other = EFactory.createOther(sketch.createVector(sketch.width / 2 + 100, sketch.height / 2))
            this._grid.setEntity(Math.floor(this._config.cellCountX / 2) - 1, Math.floor(this._config.cellCountY / 2), this._player)
            this._grid.setEntity(Math.floor(this._config.cellCountX / 2) + 1, Math.floor(this._config.cellCountY / 2), this._other)
            this._walls = this._grid.initWalls(sketch)
            this.addPickup(sketch)
        }
    }

    loadLevel(idx, sketch) {
        this._level={
            stepUpdaters:[],
            winCondition:null,
            numPickedUp: 0,
        }

        this._gameStepCounter=0
        this._nextPickupGameTime=0
        this._numPickupsRunning=0

        this._grid = new Grid(sketch.createVector(3, 50), this._config.cellCountX, this._config.cellCountY, sketch)

        let level = this._config.levels[idx]
        console.log("loading level:", level.name)
        let levelGrid = level.grid
        for (var y = 0; y < this._grid.store.sizeY; y++) {
            for (var x = 0; x < this._grid.store.sizeY; x++) {
                let dataE = levelGrid[y][x]
                let e = null
                if (dataE === GameData.TYPE_PLAYER) {
                    e = EFactory.createPlayer(sketch.createVector(0, 0))
                    this._player = e
                } else if (dataE === GameData.TYPE_OTHER) {
                    e = EFactory.createOther(sketch.createVector(0, 0))
                    this._other = e
                } else if (dataE === GameData.TYPE_WALL) {
                    e = EFactory.createWall(sketch.createVector())
                    this._walls.push(e)
                }
                else if (dataE === GameData.TYPE_PICKUP) {
                    this.addPickupAt(sketch, x,y)
                }
                if (e != null) {
                    this._grid.setEntity(x, y, e)
                }
            }
        }
        if (level.spawnRate && level.spawnRate>0){
            this._level.stepUpdaters.push(new StepSpawner(level.spawnRate, this))
        }

        if (level.winCondition){
            this._level.winCondition = new ConditionInterpreter().parse(level.winCondition)
        }

        this.loadRandomWalls()

        let start = this._grid.getCellPosition(this._player)
        let end = this._grid.getCellPosition(this._other)
        let path = this._grid.store.path(start.x, start.y, end.x, end.y)
        console.log(path)
    }

    loadRandomWalls(){
        let grid = this._grid
        this._walls.forEach(function (w) {
            grid.removeEntity(w)
        })
        this._walls = []

        let num = this._config.cellCountY * this._config.cellCountX;
        for (var i =0;i<num; i++){
            let x = i%this._config.cellCountY
            let y = Math.floor(i/this._config.cellCountY)
            if (grid.getEntity(x,y).length > 0 ){
                continue;
            }
            if (this._sketch.random()>.8){
                let e = EFactory.createWall(this._sketch.createVector())
                this._grid.setEntity(x,y, e)
                if (!this.ensurePaths()){
                    this._grid.removeEntity(e)
                    continue
                }else{
                    this._walls.push(e)
                }
            }
        }
    }

    movePickup(){
        let grid = this._grid

        do {
            this._pickups.forEach(function (e) {
                grid.removeEntity(e)
            })
            this._pickups = []
            this.addPickup(this._sketch)
        }while(!this.ensurePaths())
    }

    ensurePaths(){
        let player = this._grid.getCellPosition(this._player)
        let other = this._grid.getCellPosition(this._other)

        for (var i=0;i<this._pickups.length; i++){
            let pickup = this._grid.getCellPosition(this._pickups[0])
            let playerPath = this._grid.store.path(player.x, player.y, pickup.x, pickup.y)
            if (playerPath===null){
                return false
            }
            let playerLast = playerPath[playerPath.length-2]


            let pickupNeighbors = this._grid.store.openNeighbors(pickup.x, pickup.y, [GameData.TYPE_WALL, GameData.TYPE_PICKUP])
            let otherEnsured = false
            for (var j=0;j<pickupNeighbors.length; ++j){
                let nei = pickupNeighbors[j]
                if (nei.x !== playerLast.x || nei.y !== playerLast.y){
                    let otherPath = this._grid.store.path(other.x, other.y, nei.x, nei.y)
                    if (otherPath != null ){
                        otherEnsured = true
                        break;
                    }
                }
            }
            if (!otherEnsured){
                console.log("couldn't find path for other")
                return false;
            }

            // player and other must take different paths to goal. really this should try to path to neighbors of pickup.

            // let otherLast = otherPath[otherPath.length-2]
            // if (playerLast.x === otherLast.x && playerLast.y === otherLast.y){
            //     return false
            // }
        }
        console.log("paths ensured!")
        return true
    }

    update(ctx) {

        if (this._blockingAnimations.length > 0) {
            this._state = Game.STATE_ANIMATING
        } else {
            this._state = Game.STATE_IDLE
        }

        if (this._nonBlockingAnimations.length > 0) {
            for (var i = this._nonBlockingAnimations.length - 1; i >= 0; i--) {
                let a = this._nonBlockingAnimations[i]
                if (a(ctx)) {
                    this._nonBlockingAnimations.splice(i, 1)
                }
            }
        }

        if (this._state === Game.STATE_ANIMATING) {
            for (var i = this._blockingAnimations.length - 1; i >= 0; i--) {
                let a = this._blockingAnimations[i]
                if (a(ctx)) {
                    this._blockingAnimations.splice(i, 1)
                }
            }
            this._addBlockingAnimations.forEach(element => this._blockingAnimations.push(element));
            this._addBlockingAnimations = [];
        }

        if (this._state === Game.STATE_IDLE && this._keysPressed.length > 0) {
            let dir = null
            let key = this._keysPressed[this._keysPressed.length - 1]
            if (key == Game.ACTION_LEFT) {
                dir = ctx.sketch.createVector(-1, 0)
            }
            if (key == Game.ACTION_RIGHT) {
                dir = ctx.sketch.createVector(1, 0)
            }
            if (key == Game.ACTION_UP) {
                dir = ctx.sketch.createVector(0, -1)
            }
            if (key == Game.ACTION_DOWN) {
                dir = ctx.sketch.createVector(0, 1)
            }
            if (dir != null) {
                this.doMovement(ctx, dir, this._player)
                this.doMovement(ctx, dir.copy().mult(-1), this._other)
            }
            this.pickupNeighbors(ctx)

            this._gameStepCounter++;
            for (var i = 0; i < this._level.stepUpdaters.length; i++) {
                let su = this._level.stepUpdaters[i];
                su.step(ctx, this._gameStepCounter)
            }

            if (this._level.winCondition) {
                let varCtx = this.buildGameContext()
                if (this._level.winCondition.evaluate(varCtx)){
                    console.log("win")
                    //change level
                    //cancel animations
                    this.loadLevel(1, ctx.sketch)
                }
            }
        }
        this._prevState = this._state
    }

    buildGameContext(){
        return {"numPickedUp":this._level.numPickedUp}
    }

    pickupNeighbors(ctx) {
        let pNeighbors = this._grid.findNeighborsEntity(this._player);
        let oNeighbors = this._grid.findNeighborsEntity(this._other);
        if (pNeighbors.length === 0 || oNeighbors.length === 0) {
            //done
            return;
        }
        for (var i = 0; i < pNeighbors.length; i++) {
            let pn = pNeighbors[i]
            if (oNeighbors.includes(pn)) {
                if (pn.id.startsWith(GameData.TYPE_PICKUP)) {
                    this._grid.removeEntity(pn);
                    this.removeItemOnce(this._pickups, pn)
                    this._level.numPickedUp++;
                    //spawn new pickup
                    this.addPickup(this._sketch)
                    // randomize walls
                    this.loadRandomWalls()
                }
            }
        }
    }

    removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    }

    removeItemAll(arr, value) {
        var i = 0;
        while (i < arr.length) {
            if (arr[i] === value) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }
        return arr;
    }

    doMovement(ctx, dir, e) {
        if (this._grid.canMove(dir, e)) {
            // console.log("can move")
            let endPos = this._grid.worldPosOffset(dir, e)
            this._grid.moveEntityCell(dir, e)
            this.lerp(ctx, e, e.physics.pos, endPos, 0.25, null, this._blockingAnimations)
        } else {
            //blocking ani
            let startPos = e.physics.pos
            let endPos = e.physics.pos.add(dir.copy().mult(0.25 * this._grid.cellSize))//todo
            let egrid = this
            this.lerp(ctx, e, startPos, endPos, 0.12, function (ctx1, e) {
                egrid.lerp(ctx1, e, e.physics.pos, startPos, 0.12, null, egrid._addBlockingAnimations)
            }, this._blockingAnimations)
        }
    }

    lerp(ctx, e, startPos, endPos, duration, onComplete, addTo, debug) {
        let startTime = ctx.gameTime
        let animation = function (ctx1) {
            let amount = (ctx1.gameTime - startTime) / duration;
            if (amount > 1) {
                amount = 1
            }
            let pos = p5.Vector.lerp(startPos, endPos, amount);
            if (debug && Math.floor(amount * 100) % 10 === 0) {
                console.log("amount:", amount)
                console.log("pos:", pos.toString())
            }
            e.physics.pos = pos;
            let done = amount >= 1
            if (done) {
                if (onComplete != null) {
                    onComplete(ctx1, e)
                }
            }
            return done
        }
        addTo.push(animation)
    }

    keyPressed(e) {
        if (e.key in Game.ACTIONS) {
            this._keysPressed.push(e.key)
        }
    }

    keyReleased(e) {
        this.removeItemAll(this._keysPressed, e.key)
    }

    draw(ctx) {
        this.drawEntity(ctx, this._grid)
        this.drawEntity(ctx, this._player)
        this.drawEntity(ctx, this._other)
        for (var i = 0; i < this._walls.length; i++) {
            this.drawEntity(ctx, this._walls[i]);
        }
        for (var i = 0; i < this._pickups.length; i++) {
            this.drawEntity(ctx, this._pickups[i]);
        }

        //debug draw
        ctx.sketch.text(ctx.dt, ctx.sketch.width - 45, 10);
        ctx.sketch.text(this.stateText(), 10, 20)

        this.debugMiddleDot(ctx);
    }

    debugMiddleDot(ctx) {
        ctx.sketch.fill(255);
        let sub = this._other.physics.pos.sub(this._player.physics.pos)
        sub = sub.mult(0.5).add(this._player.physics.pos);
        ctx.sketch.ellipse(sub.x, sub.y, 5, 5);
    }

    stateText() {
        if (this._state === Game.STATE_IDLE) {
            return "idle"
        } else if (this._state === Game.STATE_ANIMATING) {
            return "animating"
        }
        return "invalid state"
    }


    drawEntity(ctx, e) {
        e.sprite.draw(ctx, e.physics)
    }

    addPickupDelay(ctx) {
        this._numPickupsRunning++;
        let imageName = this._pickupImageNames[this._numPickupsRunning % this._pickupImageNames.length];
        let image = this._config.assetManager.getImage(imageName)

        let startPos = this._other.physics.pos
        let pickup = EFactory.createPickup(startPos, this._grid.cellSize, image)
        this._pickups.push(pickup)

        let res = this._grid.randomEmptyCellAndWorldPos(ctx)
        let cell = res[0]
        let pos = res[1]
        let thisGame = this
        // console.log("start:",ctx.gameTime)
        this.lerp(ctx, pickup, startPos, pos, 1.05, function (ctx, e) {
            thisGame._grid.setEntity(cell.x, cell.y, e)
            // console.log("end:",ctx.gameTime)
        }, this._nonBlockingAnimations)

        this._nextPickupGameTime = this._gameStepCounter + 15
    }

    //deprecated
    addPickup(sketch) {
        this._numPickupsRunning++;
        let imageName = this._pickupImageNames[this._numPickupsRunning % this._pickupImageNames.length];
        let image = this._config.assetManager.getImage(imageName)
        let pickup = this._grid.addPickup(new Context(sketch), image)
        this._pickups.push(pickup)
        this._nextPickupGameTime = this._gameStepCounter + 15
    }

    addPickupAt(sketch,x,y) {
        this._numPickupsRunning++;
        let imageName = this._pickupImageNames[this._numPickupsRunning % this._pickupImageNames.length];
        let image = this._config.assetManager.getImage(imageName)
        let pickup = this._grid.addPickup(new Context(sketch), image)
        this._grid.setEntity(x,y,pickup)
        this._pickups.push(pickup)
        this._nextPickupGameTime = this._gameStepCounter + 15
    }
}

Game.ACTION_LEFT = 'a';
Game.ACTION_RIGHT = 'd';
Game.ACTION_UP = 'w';
Game.ACTION_DOWN = 's';
Game.ACTIONS = {
    'a': Game.ACTION_LEFT,
    'd': Game.ACTION_RIGHT,
    'w': Game.ACTION_UP,
    's': Game.ACTION_DOWN,
}
Game.STATE_IDLE = 0;
Game.STATE_ANIMATING = 1;
