class StepSpawner extends StepUpdate {

    _spawnRate = 0;
    _nextPickupGameTime = 0;
    _game = null;
    _numPickups = 0;
    _lastStepCounter = 0

    constructor(spawnRate, game) {
        super();
        this._spawnRate = spawnRate;
        this._nextPickupGameTime = spawnRate;
        this._game = game;
        this._numPickups = this._game._level.numPickedUp | 0
        this.reset(this._game._gameStepCounter)
    }

    // return true if the logic is complete.
    step(ctx, stepCounter) {
        // if number of pickups has changed
        if (this._numPickups !== this._game._level.numPickedUp) {
            this.reset(stepCounter)
            return true
        }
        if (stepCounter === this._nextPickupGameTime) {
            //move it!
            this._game.movePickup()
            this._numPickups = this._game._level.numPickedUp
            this.reset(stepCounter)
            return true
        }
        let percentToSpawn = (stepCounter - this._nextPickupGameTime) / this._spawnRate
        this._game.jitterPickup(ctx, percentToSpawn)

        this._lastStepCounter = this._game._gameStepCounter
        return false
    }

    reset(stepCounter) {
        this._nextPickupGameTime = stepCounter + this._spawnRate;
        this._lastStepCounter = this._game._gameStepCounter
    }

    remaining() {
        return this._nextPickupGameTime - this._lastStepCounter
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
    _animatingEntities = [];
    _numPickupsRunning = 0;

    _nextPickupGameTime = 0;
    _gameStepCounter = 0;


    _blockingAnimations = []
    _addBlockingAnimations = []
    _nonBlockingAnimations = []

    _pickupImageNames = []

    _keysPressed = []

    _debugMode = false

    _level = {
        pickupSpawnExpirationStepUpdater: null,
        stepUpdaters: [],
        winCondition: null,//object condition with evaluate func
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
        this._level = {
            stepUpdaters: [],
            winCondition: null,
            numPickedUp: 0,
            spawnRate: 15,
        }

        this._gameStepCounter = 0
        this._nextPickupGameTime = 0
        this._numPickupsRunning = 0

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
                } else if (dataE === GameData.TYPE_PICKUP) {
                    this.addPickupAt(sketch, x, y)
                }
                if (e != null) {
                    this._grid.setEntity(x, y, e)
                }
            }
        }
        if (level.spawnRate && level.spawnRate > 0) {
            this._level.spawnRate = level.spawnRate
            // this._level.stepUpdaters.push(new StepSpawner(level.spawnRate, this))
        }

        if (level.winCondition) {
            this._level.winCondition = new ConditionInterpreter().parse(level.winCondition)
        }

        this.loadRandomWalls()
    }

    loadRandomWalls() {
        let grid = this._grid
        this._walls.forEach(function (w) {
            grid.removeEntity(w)
        })
        this._walls = []

        let num = this._config.cellCountY * this._config.cellCountX;
        for (var i = 0; i < num; i++) {
            let x = i % this._config.cellCountY
            let y = Math.floor(i / this._config.cellCountY)
            if (grid.getEntity(x, y).length > 0) {
                continue;
            }
            if (this._sketch.random() > .8) {
                let e = EFactory.createWall(this._sketch.createVector())
                this._grid.setEntity(x, y, e)
                if (!this.ensurePaths()) {
                    this._grid.removeEntity(e)
                } else {
                    this._walls.push(e)
                }
            }
        }
        if (this.renderPaths == null) {
            this.ensurePaths()
            if (this.renderPaths == null) {
                //probably a bug
                throw new Error("YO I need the paths for this")
            }
        }

        let pathLength = 0
        for (var i = 0; i < this.renderPaths.length; i++) {
            if (this.renderPaths[i].path == null) {
                console.log("i's null")
            }
            pathLength += this.renderPaths[i].path.length
        }
        pathLength = Math.max(pathLength + 10, this._level.spawnRate)

        this._level.pickupSpawnExpirationStepUpdater = new StepSpawner(pathLength, this)
    }

    movePickup() {
        let grid = this._grid

        do {
            this._pickups.forEach(function (e) {
                grid.removeEntity(e)
            })
            this._pickups = []
            this.addPickup(this._sketch)
        } while (!this.ensurePaths())
    }

    ensurePaths() {
        this.renderPaths = null

        let player = this._grid.getCellPosition(this._player)
        let other = this._grid.getCellPosition(this._other)

        let playerPath = null
        let otherPath = null
        let grid = this._grid
        _.each(this._pickups, function (p) {
            let pickup = grid.getCellPosition(p)
            playerPath = grid.store.path(player.x, player.y, pickup.x, pickup.y)
            if (playerPath === null) {
                return false
            }
            let playerLast = playerPath[playerPath.length - 2]

            let pickupNeighbors = grid.store.openNeighbors(pickup.x, pickup.y, [GameData.TYPE_WALL, GameData.TYPE_PICKUP], true)
            let otherEnsured = false
            for (var j = 0; j < pickupNeighbors.length; ++j) {
                let nei = pickupNeighbors[j]
                if (nei.x !== playerLast.x || nei.y !== playerLast.y) {
                    otherPath = grid.store.path(other.x, other.y, nei.x, nei.y)
                    if (otherPath != null) {
                        otherEnsured = true
                        break;
                    }
                }
            }
            if (!otherEnsured) {
                console.log("couldn't find path for other")
                return false;
            }
        })
        // for (var i = 0; i < this._pickups.length; i++) {
        //
        //
        //
        // }
        if (playerPath == null) {
            console.log("wat")
        }
        console.log("paths ensured!")
        this.renderPaths = [
            {"path": playerPath, "color": this._sketch.color(255)},
            {"path": otherPath, "color": this._sketch.color(100)}
        ]
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

            // step updaters
            this._gameStepCounter++;
            for (var i = 0; i < this._level.stepUpdaters.length; i++) {
                let su = this._level.stepUpdaters[i];
                su.step(ctx, this._gameStepCounter)
            }
            this._level.pickupSpawnExpirationStepUpdater.step(ctx, this._gameStepCounter)
            // if (this._level.pickupSpawnExpirationStepUpdater.step(ctx, this._gameStepCounter)){
            //     Math.max(this._level.spawnRate)
            //     this._level.pickupSpawnExpirationStepUpdater = new StepSpawner( this._level.spawnRate, this)
            // }

            // update components for each entity
            for (var i = 0; i < this._pickups.length; i++) {
                this.drawEntity(ctx, this._pickups[i]);
            }

            if (this._level.winCondition) {
                let varCtx = this.buildGameContext()
                if (this._level.winCondition.evaluate(varCtx)) {
                    console.log("win")
                    //change level
                    //cancel animations
                    this.loadLevel(1, ctx.sketch)
                }
            }
        }
        this._prevState = this._state
    }

    buildGameContext() {
        return {"numPickedUp": this._level.numPickedUp}
    }

    pickupNeighbors(ctx) {
        let game = this;
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

                    this._animatingEntities.push(pn)
                    let dest = this._grid.getEntityWorldPos(this._other)
                    this.lerp(ctx, pn, pn.physics.pos, dest, 1, function () {
                        game.removeItemOnce(game._animatingEntities, pn)
                    }, this._nonBlockingAnimations)

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

    //todo on focus out remove all keys pressed
    keyReleased(e) {
        this.removeItemAll(this._keysPressed, e.key)

        if (e.key === Game.ACTION_DEBUG_MODE) {
            this._debugMode = !this._debugMode
        }
    }

    //todo
    jitterPickup(ctx, percentToSpawn) {
        for (var i = 0; i < this._pickups.length; i++) {
            // this.drawEntity(ctx, this._pickups[i]);
        }
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
        for (var i = 0; i < this._animatingEntities.length; i++) {
            this.drawEntity(ctx, this._animatingEntities[i]);
        }

        ctx.sketch.text("Score: " + this._numPickupsRunning, 10, 20);
        ctx.sketch.text(this._level.pickupSpawnExpirationStepUpdater.remaining(), 10, 10);

        //debug draw
        if (this._debugMode) {
            ctx.sketch.text(ctx.dt, ctx.sketch.width - 45, 10);
            ctx.sketch.text(this.stateText(), ctx.sketch.width - 45, 20)

            if (this.renderPaths && this.renderPaths.length > 0) {
                for (var i = 0; i < this.renderPaths.length; ++i) {
                    let path = this.renderPaths[i].path
                    let pathColor = this.renderPaths[i].color
                    ctx.sketch.stroke(pathColor)
                    for (var p = 1; p < path.length; ++p) {
                        let start = this._grid.worldPos(path[p - 1].x, path[p - 1].y)
                        let end = this._grid.worldPos(path[p].x, path[p].y)
                        ctx.sketch.line(start.x + i, start.y + i, end.x + i, end.y + i)
                    }
                }
            }

            this.debugMiddleDot(ctx);
        }
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

    removePickupAnimated(ctx, idx) {
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
        this.lerp(ctx, pickup, startPos, pos, 1.05, function (ctx, e) {
            thisGame._grid.setEntity(cell.x, cell.y, e)
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

    addPickupAt(sketch, x, y) {
        this._numPickupsRunning++;
        let imageName = this._pickupImageNames[this._numPickupsRunning % this._pickupImageNames.length];
        let image = this._config.assetManager.getImage(imageName)
        let pickup = this._grid.addPickup(new Context(sketch), image)
        this._grid.setEntity(x, y, pickup)
        this._pickups.push(pickup)
        this._nextPickupGameTime = this._gameStepCounter + 15
    }
}

Game.ACTION_LEFT = 'a';
Game.ACTION_RIGHT = 'd';
Game.ACTION_UP = 'w';
Game.ACTION_DOWN = 's';
Game.ACTION_DEBUG_MODE = 'g';
Game.ACTIONS = {
    [Game.ACTION_LEFT]: Game.ACTION_LEFT,
    [Game.ACTION_RIGHT]: Game.ACTION_RIGHT,
    [Game.ACTION_UP]: Game.ACTION_UP,
    [Game.ACTION_DOWN]: Game.ACTION_DOWN,
}
Game.STATE_IDLE = 0;
Game.STATE_ANIMATING = 1;
