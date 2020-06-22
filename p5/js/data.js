const e = null;
const w = "WALL";
const p = "PLAYER";
const o = "OTHER"
const i = "PICKUP"
//7x7
const levels = [

    {
        "name": "luke",
        "grid": [
            [e,e,e,e,e,e,e],
            [e,w,e,e,w,e,e],
            [e,p,e,w,e,e,e],
            [e,e,e,e,e,e,e],
            [e,e,e,w,e,e,w],
            [w,e,e,e,e,e,e],
            [e,e,e,e,o,e,e],
        ]
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
        ]
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
        ]
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
        ]
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
        ]
    }
]

class GameData {
    static getLevels() {return levels}
}
GameData.TYPE_WALL=w
GameData.TYPE_PLAYER=p
GameData.TYPE_OTHER=o
GameData.TYPE_PICKUP=i
