// in progress

class Level{
    _grid = Grid;
    _player = null;
    _other = null;
    _walls = [];
    _pickups = [];
    _gameStepCounter = 0;
    _numPickupsRunning = 0;
    _stepUpdaters = []

    load(idx, config){
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
            this._stepUpdaters.push(new StepSpawner(level.spawnRate, this))
        }
    }

    step(ctx ){
        this._gameStepCounter++;
        for (var i = 0; i < this._stepUpdaters.length; i++) {
            let su = this._stepUpdaters[i];
            su.step(ctx, this._gameStepCounter)
        }

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
                    // this._pickups.remove(pn);
                    this.removeItemOnce(this._pickups, pn)
                }
            }
        }
    }
}