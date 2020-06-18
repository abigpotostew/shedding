class Game {

    #config = null;
    #sketch = null;
    #state = Game.STATE_IDLE;
    #prevState = Game.STATE_IDLE;
    #grid = Grid;
    #player = null;
    #other = null;
    #walls = null;
    #pickups = null;
    #numPickupsRunning = 0;
    #nextPickupGameTime = 0;
    #gameStepCounter = 0;

    #keyIsPressed = false
    #keyPressedCurrent = null;
    #priorKeyPressed = "";

    #blockingAnimations = []
    #addBlockingAnimations = []

    #pickupImageNames = []

    constructor(sketch, config) {
        this.#sketch = sketch
        this.#config = config
        this.#grid = new Grid(sketch.createVector(0, 50), config.cellCountX, config.cellCountY, sketch)
        this.#player = EFactory.createPlayer(sketch.createVector(sketch.width / 2 - 100, sketch.height / 2))
        this.#other = EFactory.createOther(sketch.createVector(sketch.width / 2 + 100, sketch.height / 2))
        this.#grid.setEntity(Math.floor(this.#config.cellCountX / 2) - 1, Math.floor(this.#config.cellCountY / 2), this.#player)
        this.#grid.setEntity(Math.floor(this.#config.cellCountX / 2) + 1, Math.floor(this.#config.cellCountY / 2), this.#other)


        this.#walls = this.#grid.initWalls(sketch)

        this.#pickupImageNames = config.assetManager.pickupImageNames();
        this.#pickups = []
        this.addPickup(sketch)
    }

    update(ctx) {

        if (this.#blockingAnimations.length > 0) {
            this.#state = Game.STATE_ANIMATING
        } else {
            this.#state = Game.STATE_IDLE
        }

        if (this.#state === Game.STATE_ANIMATING) {
            for (var i = this.#blockingAnimations.length - 1; i >= 0; i--) {
                let a = this.#blockingAnimations[i]
                if (a(ctx)) {
                    this.#blockingAnimations.splice(i, 1)
                }
            }
            this.#addBlockingAnimations.forEach(element => this.#blockingAnimations.push(element));
            this.#addBlockingAnimations = [];
        }

        if (this.#state === Game.STATE_IDLE && this.#keyPressedCurrent) {
            let dir = null
            let key = this.#keyPressedCurrent
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
                this.doMovement(ctx, dir, this.#player)
                this.doMovement(ctx, dir.copy().mult(-1), this.#other)
            }
            this.pickupNeighbors(ctx)

            if (this.#gameStepCounter == this.#nextPickupGameTime) {
                this.addPickup(ctx.sketch)
            }
            this.#gameStepCounter++;
        }
        this.#keyPressedCurrent = null
        this.#prevState = this.#state
    }

    pickupNeighbors(ctx) {
        let pNeighbors = this.#grid.findNeighborsEntity(this.#player);
        let oNeighbors = this.#grid.findNeighborsEntity(this.#other);
        if (pNeighbors.length === 0 || oNeighbors.length === 0) {
            //done
            return;
        }
        for (var i = 0; i < pNeighbors.length; i++) {
            let pn = pNeighbors[i]
            if (oNeighbors.includes(pn)) {
                if (pn.id.startsWith("PICKUP")) {
                    this.#grid.removeEntity(pn);
                    // this.#pickups.remove(pn);
                    this.removeItemOnce(this.#pickups, pn)
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

    doMovement(ctx, dir, e) {
        if (this.#grid.canMove(dir, e)) {
            // console.log("can move")
            let endPos = this.#grid.worldPosOffset(dir, e)
            this.#grid.moveEntityCell(dir, e)
            this.lerp(ctx, e, e.physics.pos, endPos, 0.25, null, this.#blockingAnimations)
        } else {
            //blocking ani
            let startPos = e.physics.pos
            let endPos = e.physics.pos.add(dir.copy().mult(0.25 * this.#grid.cellSize))//todo
            let egrid = this
            this.lerp(ctx, e, startPos, endPos, 0.12, function (ctx1, e) {
                egrid.lerp(ctx1, e, e.physics.pos, startPos, 0.12, null, egrid.#addBlockingAnimations)
            }, this.#blockingAnimations)
        }
    }

    lerp(ctx, e, startPos, endPos, duration, onComplete, addTo) {
        let startTime = ctx.gameTime
        let animation = function (ctx1) {
            let amount = (ctx1.gameTime - startTime) / duration;
            if (amount > 1) {
                amount = 1
            }
            let pos = p5.Vector.lerp(startPos, endPos, amount);
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
        this.#keyIsPressed = true
        this.#keyPressedCurrent = e.key
    }

    keyReleased(e) {
        // this.#keyIsPressed = false
        // this.#keyPressedCurrent = null
    }

    draw(ctx) {
        this.drawEntity(ctx, this.#grid)
        this.drawEntity(ctx, this.#player)
        this.drawEntity(ctx, this.#other)
        for (var i = 0; i < this.#walls.length; i++) {
            this.drawEntity(ctx, this.#walls[i]);
        }
        for (var i = 0; i < this.#pickups.length; i++) {
            this.drawEntity(ctx, this.#pickups[i]);
        }

        //debug draw
        ctx.sketch.text(ctx.dt, ctx.sketch.width - 45, 10);
        ctx.sketch.text(this.stateText(), 10, 20)

        this.debugMiddleDot(ctx);
    }

    debugMiddleDot(ctx) {
        ctx.sketch.fill(255);
        let sub = this.#other.physics.pos.sub(this.#player.physics.pos)
        sub = sub.mult(0.5).add(this.#player.physics.pos);
        ctx.sketch.ellipse(sub.x, sub.y, 5, 5);
    }

    stateText() {
        if (this.#state === Game.STATE_IDLE) {
            return "idle"
        } else if (this.#state === Game.STATE_ANIMATING) {
            return "animating"
        }
        return "invalid state"
    }


    drawEntity(ctx, e) {
        e.sprite.draw(ctx, e.physics)
    }

    addPickup(sketch) {
        this.#numPickupsRunning++;
        let imageName = this.#pickupImageNames[this.#nextPickupGameTime % this.#pickupImageNames.length];
        let image = this.#config.assetManager.getImage(imageName)
        let pickup = this.#grid.addPickup(new Context(sketch), image)
        this.#pickups.push(pickup)
        this.#nextPickupGameTime = this.#gameStepCounter + 15

    }
}

Game.ACTION_LEFT = 'a';
Game.ACTION_RIGHT = 'd';
Game.ACTION_UP = 'w';
Game.ACTION_DOWN = 's';
Game.STATE_IDLE = 0;
Game.STATE_ANIMATING = 1;
