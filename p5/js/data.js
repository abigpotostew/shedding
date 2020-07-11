const e = null;
const w = "WALL";
const p = "PLAYER";
const o = "OTHER"
const i = "PICKUP"
const DEF_SPAWN_RATE=15;

const VAR="VAR"
const VALUE="VALUE"
const VAR_NUM_PICKUPS="numPickedUp"

const COND="COND"
const COND_EQ="EQ"

//7x7
const levels = [

    {
        "name": "path-test-hard",
        "grid": [
            [p,e,w,e,o,w,w],
            [w,e,e,e,w,w,w],
            [w,w,i,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
        ],
        "nextLevel":"tutorial1",
        "winCondition": {[VAR]:VAR_NUM_PICKUPS,[COND]:COND_EQ,[VALUE]:1},
    },
    {
        "name": "path-test-curve",
        "grid": [
            [p,e,w,w,w,w,w],
            [w,e,w,w,w,w,w],
            [w,o,i,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
        ],
        "nextLevel":"tutorial1",
        "winCondition": {[VAR]:VAR_NUM_PICKUPS,[COND]:COND_EQ,[VALUE]:1},
    },
    {
        "name": "tutorial2",
        "grid": [
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,e,w,w],
            [p,e,e,w,e,e,o],
            [w,w,e,e,e,w,w],
            [w,w,i,w,w,w,w],
            [w,w,w,w,w,w,w],
        ],
        "nextLevel":"tutorial1",
        "winCondition": {[VAR]:VAR_NUM_PICKUPS,[COND]:COND_EQ,[VALUE]:1},
    },
    {
        "name": "tutorial1",
        "grid": [
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [p,e,e,i,e,e,o],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
            [w,w,w,w,w,w,w],
        ]
    },
    {
        "name": "luke",
        "grid": [
            [e,e,e,e,e,e,e],
            [e,w,e,e,e,w,e],
            [e,p,e,w,e,e,e],
            [e,e,e,e,e,e,e],
            [e,e,e,w,e,e,w],
            [w,e,e,e,e,e,e],
            [e,e,e,e,o,e,e],
        ],
        spawnRate: DEF_SPAWN_RATE,
    },
    {
        "name": "cross-med",
        "grid": [
            [e,e,e,e,e,e,e],
            [e,w,e,e,e,e,e],
            [e,p,e,w,e,e,e],
            [e,e,w,w,w,e,e],
            [e,e,e,w,e,e,e],
            [e,e,e,e,e,e,e],
            [e,e,e,e,o,e,e],
        ],
        spawnRate: DEF_SPAWN_RATE,
    },
    {
        "name": "cross-hard",
        "grid": [
            [e,e,e,e,e,e,e],
            [e,e,e,e,e,e,e],
            [e,p,e,w,e,e,e],
            [e,e,w,w,w,e,e],
            [e,e,e,w,e,e,e],
            [e,e,e,e,e,e,e],
            [e,e,e,e,o,e,e],
        ],
        spawnRate: DEF_SPAWN_RATE,
    },
    {
        "name": "dsfgsd",
        "grid": [
            [e,e,e,e,e,e,e],
            [e,e,e,e,e,e,e],
            [e,p,e,w,e,e,e],
            [e,e,e,w,e,e,e],
            [e,e,e,w,e,o,e],
            [e,e,w,e,e,e,e],
            [e,e,e,e,e,e,e],
        ],
        spawnRate: DEF_SPAWN_RATE,
    },
    {
        "name": "kinda hard with individual squares",
        "grid": [
            [e,e,e,e,e,e,e],
            [e,e,e,w,e,e,e],
            [e,p,e,e,e,e,e],
            [e,e,e,w,e,e,e],
            [e,e,e,e,e,o,e],
            [e,e,w,e,w,e,e],
            [e,e,e,e,e,e,e],
        ],
        spawnRate: DEF_SPAWN_RATE,
    }
]

class GameData {
    static getLevels() {return levels}
}
GameData.TYPE_WALL=w
GameData.TYPE_PLAYER=p
GameData.TYPE_OTHER=o
GameData.TYPE_PICKUP=i

GameData.VAR="VAR"
GameData.COND_EQ="EQ"
GameData.VAR_NUM_PICKUPS=VAR_NUM_PICKUPS
GameData.VALUE=VALUE
GameData.COND=COND