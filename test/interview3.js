const {assert, expect} = require('chai')

const maze = [
    [1,1,1,0,1,1,1,1],
    [0,0,0,0,0,0,1,1],
    [0,1,1,0,1,0,0,0],
    [0,1,1,0,1,1,1,0],
    [0,1,0,0,0,0,0,0],
    [0,1,0,1,1,1,1,1],
    [0,1,0,1,1,1,1,1]
]

function printMaze(pos) {
    maze.forEach((arr,index) => {
        const arrStr = arr.map(cell => { return cell == 0 ? '     ' : '#####' })
        if(index == pos.y)
            arrStr[pos.x] = '  x  '
        console.log(`${arrStr.join('')}\n`)
    })
}



const target = {x: 2, y: 6}

const states = { checked: 2, unchecked: 0, blocked: 1 }

class Position {
    #coords
    #_dirs = []

    constructor(coords) {
        this.#coords = coords
        this.#initDirs()
        this._coords = coords;
    }

    #initDirs() {
        const left = {x: this.#coords.x - 1, y: this.#coords.y}
        if (left.x >= 0 && maze[left.y][left.x] != states.blocked)
            this.#_dirs.push(left)

        const down = {x: this.#coords.x, y: this.#coords.y + 1}
        if (down.y < maze.length && maze[down.y][down.x] != states.blocked)
            this.#_dirs.push(down)

        const right = {x: this.#coords.x + 1, y: this.#coords.y}
        if (right.x < maze[0].length && maze[right.y][right.x] != states.blocked)
            this.#_dirs.push(right)
    }

    get dirs() {
        return this.#_dirs;
    }

    get coords() {
        return this._coords;
    }
}

function move(pos, target) {
    console.log(`${pos.coords.x} ${pos.coords.y}`)
    if(maze[pos.coords.y][pos.coords.x] == states.blocked && pos.dirs.length == 0)
        return false
    if(pos.coords.x == target.x && pos.coords.y == target.y) {
        return true
    }
    maze[pos.coords.y][pos.coords.x] = states.blocked
    while(pos.dirs.length > 0) {
        const next = pos.dirs.pop()
        if(move(new Position(next), target))
            return true
    }
    return false
}


describe('Maze', async () => {
    it('Initialize directions', async () => {
        let pos = new Position({x: 3, y: 0}, null)
        const left = (position, state) => { return {coord: {x: position.coords.x - 1, y: position.coords.y}, state: state} }
        const right = (position, state) => { return {coord: {x: position.coords.x + 1, y: position.coords.y}, state: state} }
        const down = (position, state) => { return {coord: {x: position.coords.x, y: position.coords.y + 1}, state: state} }
        assert.equal(JSON.stringify(left(pos, states.blocked)), JSON.stringify(pos.dirs[0]))
        assert.equal(JSON.stringify(down(pos, states.unchecked)), JSON.stringify(pos.dirs[1]))
        assert.equal(JSON.stringify(right(pos, states.blocked)), JSON.stringify(pos.dirs[2]))

        pos = new Position({x: 3, y: 1}, null)
        assert.equal(JSON.stringify(left(pos, states.unchecked)), JSON.stringify(pos.dirs[0]))
        assert.equal(JSON.stringify(down(pos, states.unchecked)), JSON.stringify(pos.dirs[1]))
        assert.equal(JSON.stringify(right(pos, states.unchecked)), JSON.stringify(pos.dirs[2]))

        pos = new Position({x: 7, y: 4}, null)
        assert.equal(JSON.stringify(left(pos, states.blocked)), JSON.stringify(pos.dirs[0]))
        assert.equal(JSON.stringify(down(pos, states.blocked)), JSON.stringify(pos.dirs[1]))
        assert.equal(JSON.stringify(right(pos, states.blocked)), JSON.stringify(pos.dirs[2]))

        pos = new Position({x: 4, y: 4}, null)
        assert.equal(JSON.stringify(left(pos, states.unchecked)), JSON.stringify(pos.dirs[0]))
        assert.equal(JSON.stringify(down(pos, states.blocked)), JSON.stringify(pos.dirs[1]))
        assert.equal(JSON.stringify(right(pos, states.unchecked)), JSON.stringify(pos.dirs[2]))

        pos = new Position({x: 0, y: 6}, null)
        assert.equal(JSON.stringify(left(pos, states.blocked)), JSON.stringify(pos.dirs[0]))
        assert.equal(JSON.stringify(down(pos, states.blocked)), JSON.stringify(pos.dirs[1]))
        assert.equal(JSON.stringify(right(pos, states.blocked)), JSON.stringify(pos.dirs[2]))
    })

    it('Moving', () => {
        if(move(new Position({x: 3, y: 0}), {x: 1, y: 6}))
            console.log("Found")
        else
            console.log("No way")
    })
})
