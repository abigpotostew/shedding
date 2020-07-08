const e = null;
const w = "WALL";
const p = "PLAYER";
const o = "OTHER"
const i = "PICKUP"
const DEF_SPAWN_RATE=15;
//7x7
const levels = [

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
        ]
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
