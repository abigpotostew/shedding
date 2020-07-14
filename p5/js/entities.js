class EntityStore {
    items = {}
    lookupByItem = {}
    sizeY = 0
    sizeX = 0

    constructor(sizeX, sizeY) {
        this.sizeY = sizeY;
        this.sizeX = sizeX;
    }

    removeEntity(entity) {
        let cell = this.lookupByItem[entity.id]
        if (cell == null) {
            return false
        }
        let bucket = this.items[cell.y * this.sizeY + cell.x]
        delete bucket[entity.id]
        delete this.lookupByItem[entity.id]
        return true
    }

    putEntity(x, y, entity) {
        if (!this.inBounds(x, y)) {
            throw new Error("out of bounds");
        }
        this.removeEntity(entity)

        let bucket = this.items[y * this.sizeY + x]
        if (bucket == null) {
            bucket = {}
        }
        bucket[entity.id] = entity
        this.items[y * this.sizeY + x] = bucket
        this.lookupByItem[entity.id] = new Cell(x, y)
    }

    findAt(x, y) {
        if (!this.inBounds(x, y)) {
            throw new Error("out of bounds: " + x + ", " + y);
        }
        let bucket = this.items[y * this.sizeY + x]
        let output = []
        if (bucket == null) {
            return output
        }
        for (let [key, value] of Object.entries(bucket)) {
            output.push(value)
        }
        return output
    }

    hasEntity(x, y) {
        if (!this.inBounds(x, y)) {
            throw new Error("out of bounds");
        }
        let bucket = this.items[y * this.sizeY + x]
        return bucket != null && Object.keys(bucket).length > 0
    }


    contains(entity) {
        return entity.id in this.lookupByItem
    }

    numEntityOfType(list, typeName) {
        let count = 0
        for (var i = 0; i < list.length; i++) {
            let e = list[i]
            if (e.id.startsWith(typeName)) {
                count++
            }
        }
        return count
    }

    findEntity(entity) {
        return this.lookupByItem[entity.id]
        // if (cell==null){
        //     return null
        // }
        // return this.items[cell.y*this.sizeY+cell.x][entity.id]
    }

    inBounds(x, y) {
        if (x < 0 || x >= this.sizeX) {
            return false
        }
        if (y < 0 || y >= this.sizeY) {
            return false
        }
        return true
    }

    openNeighbors(startx, starty, closedTypes, allowDiagonalNeighbors) {
        if (!this.inBounds(startx, starty)) {
            return []
        }
        let out = []

        let cardinalNeighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        let diagonalNeighbors = [[-1, -1], [1, 1], [1, -1], [-1, 1]]
        if (allowDiagonalNeighbors) {
            cardinalNeighbors = cardinalNeighbors.concat(diagonalNeighbors)
        }

        for (var vi = 0; vi < cardinalNeighbors.length; ++vi) {
            let x = cardinalNeighbors[vi][0]
            let y = cardinalNeighbors[vi][1]
            if (!this.inBounds(x + startx, y + starty)) {
                continue;
            }
            let entities = this.findAt(x + startx, y + starty);
            //todo collisions here rather than type
            if (entities.length !== 0 && closedTypes) {
                let isClosed = false
                for (var i = 0; i < closedTypes.length; ++i) {
                    if (this.numEntityOfType(entities, closedTypes[i]) > 0) {
                        isClosed = true
                        break;
                    }
                }
                if (isClosed) {
                    continue;
                }
            }
            out.push(new Cell(x + startx, y + starty))

        }
        return out;
    }

    path(sx, sy, dx, dy) {
        const goalNode = new PathNode(new Cell(dx, dy), this.sizeY, 0, 0)
        const sizeY = this.sizeY
        const store = this

        function newNode(x, y, h, g, addTo) {
            let node = new PathNode(new Cell(x, y), sizeY, h, g)
            if (addTo) {
                addTo[node.index] = node
            }
            return node
        }

        function leastCost(nodeDict) {
            let keys = Object.keys(nodeDict)
            let lowest = new PathNode(new Cell(0, 0), sizeY, 0, Number.MAX_VALUE)
            for (var i = 0; i < keys.length; ++i) {
                let curr = nodeDict[keys[i]]
                if (curr.cost < lowest.cost) {
                    lowest = curr
                }
            }
            return lowest
        }

        // dictionary, key == coord y*sizeY+x, value == Node
        let openList = {}
        let closeList = {}

        newNode(sx, sy, 0, 0, openList)

        while (Object.keys(openList).length > 0) {
            let currentNode = leastCost(openList)
            delete openList[currentNode.index]
            closeList[currentNode.index] = currentNode

            if (currentNode.index == goalNode.index) {
                let path = []
                let current = currentNode
                while (current) {
                    path.push(current.value)
                    current = current.parent
                }
                return path.reverse()
            }

            let children = store.openNeighbors(currentNode.value.x, currentNode.value.y, [GameData.TYPE_WALL])

            let parentNode = currentNode
            children.forEach(function (childCell) {
                let x = childCell.x
                let y = childCell.y
                if (closeList[y * sizeY + x]) {
                    return;
                }

                // heuristic is euclidean distance for now. better use manhattan distance.
                let h = Math.sqrt(Math.pow(dx - x, 2) + Math.pow(dy - y, 2))
                h = Math.ceil(h)

                let child = newNode(x, y, h, parentNode.g + 1)
                child.parent = parentNode
                if (openList[child.index]) {
                    // calc g cost
                    let existing = openList[child.index]
                    if (child.g < existing.g) {
                        existing.parent = parentNode
                        existing.g = child.g
                        existing.cost = existing.h + existing.g
                    }
                    child = existing
                }
                openList[child.index] = child
            })
        }
        //can't find a path
        return null;
    }
}

class PathNode {
    _value = new Cell()
    _idx = -1
    //f
    cost = Number.MAX_VALUE
    h = Number.MAX_VALUE
    g = Number.MAX_VALUE
    parent = null

    constructor(cell, sizeY, h, g) {
        this._value = cell;
        this._idx = cell.y * sizeY + cell.x
        this.h = h
        this.g = g
        this.cost = h + g
    }

    get index() {
        return this._idx;
    }

    get value() {
        return this._value;
    }
}

class Grid extends Entity {

    cellCountX = 0;
    cellCountY = 0;
    cellSize = 0;
    _lookup = {};
    grid = []

    store = EntityStore

    constructor(position, cellCountX, cellCountY, sketch) {
        super(new Physics(position), IdUtils.newId("GRID"), null);
        this.cellCountX = cellCountX
        this.cellCountY = cellCountY
        this.cellSize = Math.floor(sketch.width / cellCountX);
        // this.grid = new Array(cellCountY)
        // for (var i = 0; i < cellCountY; i += 1) {
        //     this.grid[i] = new Array(cellCountX)
        // }
        this.store = new EntityStore(cellCountX, cellCountY)
    }

    worldPos(x, y) {
        return this.physics.pos.add(x * this.cellSize + this.cellSize / 2, y * this.cellSize + this.cellSize / 2)
    }

    canMove(dir, e) {
        let dx = dir.x;
        let dy = dir.y;
        let cell = this.store.findEntity(e);
        let nx = cell.x + dx;
        let ny = cell.y + dy;
        if (!this.store.inBounds(nx, ny)) {
            return false
        }
        let targetEntities = this.store.findAt(nx, ny);
        return targetEntities.length === 0;
    }

    moveEntityCell(dir, e) {
        if (!this.canMove(dir, e)) {
            throw new Error("cannot move")
        }
        let cell = this.store.findEntity(e)
        this.setEntityNoPos(cell.x + dir.x, cell.y + dir.y, e)
        // this.setEntity(cell.x + dir.x, cell.y + dir.y, e)
    }

    worldPosOffset(dir, e) {
        if (this.store.contains(e)) {
            let current = this.store.findEntity(e);
            let targetX = current.x + dir.x
            let targetY = current.y + dir.y
            if (!this.validCoords(targetX, targetY)) {
                throw new Error("Invalid coords")
            }
            return this.worldPos(targetX, targetY)
        }
        throw new Error("entity not in grid")
    }

    validCoords(x, y) {
        return this.store.inBounds(x, y)
    }

    initWalls(sketch) {
        let egrid = this;
        let walls = []
        for (var y = 0; y < egrid.store.sizeY; y += 1) {
            for (var x = 0; x < egrid.store.sizeX; x += 1) {

                if (egrid.store.inBounds(x, y) && sketch.random(1) > 0.9 && egrid.store.findAt(x, y).length === 0) {
                    let wall = EFactory.createWall(sketch.createVector())
                    walls.push(wall);

                    this.setEntity(x, y, wall);
                }
            }
        }
        return walls
    }

    setEntity(x, y, e) {
        this.setEntityNoPos(x, y, e)
        e.physics.pos = this.worldPos(x, y)
    }

    setEntityNoPos(x, y, e) {
        this.store.putEntity(x, y, e)
    }

    removeEntity(e) {
        return this.store.removeEntity(e)
    }

    setEntityRandom(ctx, e) {
        let celPos = this.randomEmptyCellAndWorldPos(ctx)[0]
        this.setEntity(celPos.x, celPos.y, e)
    }

    randomEmptyCellAndWorldPos(ctx) {
        var attempt = 0;
        do {
            let x = Math.floor(ctx.sketch.random(this.store.sizeX));
            let y = Math.floor(ctx.sketch.random(this.store.sizeY));

            if (!this.store.hasEntity(x, y)) {
                return [ctx.sketch.createVector(x, y), this.worldPos(x, y)]
            }
        } while (attempt++ < this.store.sizeX * this.store.sizeY);
        throw new Error("can't find an empty cell");
    }

    addPickup(ctx, image) {
        let pickup = EFactory.createPickup(ctx.sketch.createVector(), this.cellSize, image)
        this.setEntityRandom(ctx, pickup)
        return pickup
    }


    getCellPosition(e) {
        if (!this.store.contains(e)) {
            return [];
        }
        let cell = this.store.findEntity(e)
        return cell
    }

    findNeighborsEntity(e) {
        if (!this.store.contains(e)) {
            return [];
        }
        let cell = this.store.findEntity(e)
        return this.findNeighbors(cell.x, cell.y)
    }

    findNeighbors(startx, starty) {
        if (!this.store.inBounds(startx, starty)) {
            return []
        }
        let out = []
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (x === 0 && y === 0 || !this.store.inBounds(x + startx, y + starty)) {
                    continue;
                }
                let entities = this.store.findAt(x + startx, y + starty);
                for (var i = 0; i < entities.length; i++) {
                    out.push(entities[i]);
                }

            }
        }
        return out;
    }

    getEntity(x, y) {
        return this.store.findAt(x, y)
    }

    get sprite() {
        let egrid = this;
        return {
            draw: function (ctx, physics) {
                for (var y = 0; y < egrid.store.sizeY; y += 1) {
                    for (var x = 0; x < egrid.store.sizeX; x += 1) {
                        ctx.sketch.rectMode(ctx.sketch.CENTER);
                        ctx.sketch.stroke(200, 150, 0);
                        ctx.sketch.noFill()

                        let neighbors = egrid.findNeighbors(x, y);
                        ctx.sketch.noFill();

                        let countPickups = 0
                        let entities = egrid.getEntity(x, y)
                        if (egrid.numEntityOfType(entities, GameData.TYPE_PICKUP) > 0) {
                            countPickups = 1
                        }

                        countPickups = countPickups + egrid.numEntityOfType(neighbors, GameData.TYPE_PICKUP);
                        if (countPickups > 0) {
                            ctx.sketch.fill(70 + countPickups * 15, 64 + countPickups * 13, 43 + countPickups * 10);
                        }


                        let pos = egrid.worldPos(x, y);

                        ctx.sketch.rect(pos.x, pos.y, egrid.cellSize, egrid.cellSize);
//                    ctx.app().ellipse(worldPos(x, y).x, worldPos(x, y).y, 2, 2);
                    }
                }
            }
        }
    }

    numEntityOfType(list, typeName) {
        let count = 0
        for (var i = 0; i < list.length; i++) {
            let e = list[i]
            if (e.id.startsWith(typeName)) {
                count++
            }
        }
        return count
    }
}

class EFactory {
    static createPlayer(pos) {
        return new Entity(new Physics(pos), IdUtils.newId(GameData.TYPE_PLAYER), {
            draw(ctx, phys) {
                ctx.sketch.fill(0, 200, 0)
                ctx.sketch.stroke(255)
                ctx.sketch.ellipse(phys.pos.x, phys.pos.y, 20, 20);
            }
        })
    }

    static createOther(pos) {
        return new Entity(new Physics(pos), IdUtils.newId(GameData.TYPE_OTHER), {
            draw(ctx, phys) {
                ctx.sketch.fill(200, 0, 0)
                ctx.sketch.stroke(255)
                ctx.sketch.ellipse(phys.pos.x, phys.pos.y, 20, 20);
            }
        })
    }

    static createWall(pos) {
        return new Entity(new Physics(pos), IdUtils.newId(GameData.TYPE_WALL), {
            draw(ctx, phys) {
                ctx.sketch.rectMode(ctx.sketch.CENTER);
                ctx.sketch.fill(200, 60, 150)
                ctx.sketch.stroke(30)
                ctx.sketch.rect(phys.pos.x, phys.pos.y, 40, 40)
            }
        })
    }

    static createPickup(pos, maxSize, image) {
        return new Entity(new Physics(pos), IdUtils.newId(GameData.TYPE_PICKUP), {
            draw(ctx, phys) {
                ctx.sketch.imageMode(ctx.sketch.CENTER)
                let w = image.width
                let h = image.height
                if (w > maxSize || h > maxSize) {
                    let scalar = 1
                    if (image.width >= image.height) {
                        scalar = maxSize / w
                    } else {
                        scalar = maxSize / h
                    }
                    w = w * scalar
                    h = h * scalar
                }
                ctx.sketch.image(image, phys.pos.x, phys.pos.y, w, h)
            }
        })
    }
}