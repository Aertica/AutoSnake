const CANVAS = document.getElementById('canvas')

class Point
{
    constructor(x, y)
    {
        this.x = x
        this.y = y
    }

    up = () =>
    {
        return new Point(this.x, this.y - 1)
    }

    down = () =>
    {
        return new Point(this.x, this.y + 1)
    }

    left = () =>
    {
        return new Point(this.x - 1, this.y)
    }

    right = () =>
    {
        return new Point(this.x + 1, this.y)
    }

    equals = (point) =>
    {
        return (this.x == point.x) && (this.y == point.y)
    }

    neighbors = () =>
    {
        return [this.left(), this.down(), this.right(), this.up()].sort((a, b) => {return 0.5 - Math.random()})
    }

    adjacentTo = (point) =>
    {
        if(point.equals(this.up())) return 1
        if(point.equals(this.right())) return 2
        if(point.equals(this.down())) return 3
        if(point.equals(this.left())) return 4
    }

    in = (points) =>
    {
        for(let i = 0; i < points.length; i++)
        {
            if(this.equals(points[i])) return i
        }
        return false
    }

    within = (grid) =>
    {
        return (this.x > -1) && (this.x < grid.width) && (this.y > -1) && (this.y < grid.height)
    }

    static toIndex = (x, y, grid) =>
    {
        return (y * grid.width) + x
    }

    static fromIndex = (i, grid) =>
    {
        return new Point((i % grid.width), ~~(i / grid.width))
    }

    static random = (grid) =>
    {
        return Point.fromIndex(~~(Math.random() * grid.width * grid.height), grid)
    }
}

class Tile
{
    static length = 100

    constructor(index, width)
    {
        this.point = new Point(index % width, ~~(index / width))
    }

    drawTile = (color, edges=[]) => 
    {
        let ctx = CANVAS.getContext('2d')
        ctx.beginPath()
        ctx.fillStyle = color

        let margin = Math.max(Tile.length * 0.02, 1)
        let X = (this.point.x * Tile.length) + margin
        let Y = (this.point.y * Tile.length) + margin
        let length = Tile.length - (margin * 2)
        ctx.rect(X, Y, length, length)

        for(let edge of edges)
        {
            let x, y, width, height
            switch(edge)
            {
                case 1:
                    x = X
                    y = Y - margin
                    width = length
                    height = margin
                    ctx.rect(x, y, width, height)
                    break
                case 2:
                    x = X + length
                    y = Y
                    width = margin + 1
                    height = length
                    ctx.rect(x, y, width, height)
                    break
                case 3:
                    x = X
                    y = Y + length
                    width = length
                    height = margin + 1
                    ctx.rect(x, y, width, height)
                    break
                case 4:
                    x = X - margin
                    y = Y
                    width = margin
                    height = length
                    ctx.rect(x, y, width, height)
                    break
            }
        }

        ctx.fill()
    }

    drawPath = (edges) =>
    {
        let ctx = CANVAS.getContext('2d')
        ctx.beginPath()
        ctx.fillStyle = '#444444'

        let X = (this.point.x * Tile.length) + ~~(Tile.length / 2)
        let Y = (this.point.y * Tile.length) + ~~(Tile.length / 2)
        let longEdge = ~~(Tile.length * 0.5)
        let shortEdge = Math.max(~~(Tile.length * 0.04), 1)
        ctx.arc(X, Y, (longEdge / 3), 0, (2 * Math.PI))

        for(let edge of edges)
        {
            let x, y, width, height
            switch(edge)
            {
                case 1:
                    x = X - (shortEdge / 2)
                    y = Y - longEdge
                    width = shortEdge
                    height = longEdge
                    ctx.rect(x, y, width, height)
                    break
                case 2:
                    x = X
                    y = Y - (shortEdge / 2)
                    width = longEdge + 2
                    height = shortEdge
                    ctx.rect(x, y, width, height)
                    break
                case 3:
                    x = X - (shortEdge / 2)
                    y = Y
                    width = shortEdge
                    height = longEdge + 2
                    ctx.rect(x, y, width, height)
                    break
                case 4:
                    x = X - longEdge
                    y = Y - (shortEdge / 2)
                    width = longEdge
                    height = shortEdge
                    ctx.rect(x, y, width, height)
                    break
            }
        }

        ctx.fill()
    }
}

class Grid
{
    constructor(width, height)
    {
        this.width = width
        this.height = height
        this.tiles = new Array(width * height)
        for(let i = 0; i < this.tiles.length; i++) this.tiles[i] = new Tile(i, width)
    }

    get = (point) =>
    {
        return this.tiles[Point.toIndex(point.x, point.y, this)]
    }
}

class Snake
{
    static snakeColor = '#00ff00'
    static foodColor = '#ff0000'

    constructor(grid)
    {
        this.grid = grid
        this.head = Point.random(grid)
        this.body = [this.head]
        this.food = Point.random(grid)
        this.length = 6
        this.#draw()
    }

    up = () =>
    {
        if(this.head.up().within(this.grid))
        {
            this.head = this.head.up()
            return this.#move()
        }
    }

    down = () =>
    {
        if(this.head.down().within(this.grid))
        {
            this.head = this.head.down()
            return this.#move()
        }
    }

    left = () =>
    {
        if(this.head.left().within(this.grid))
        {
            this.head = this.head.left()
            return this.#move()
        }
    }

    right = () =>
    {
        if(this.head.right().within(this.grid))
        {
            this.head = this.head.right()
            return this.#move()
        }
    }

    #move = () =>
    {
        if(this.head.in(this.body)) return true

        this.body.unshift(this.head)
        while(this.body.length > this.length) this.body.pop()

        if(this.head.equals(this.food))
        {
            this.length += 2
            this.#moveFood()
        }

        this.#draw()
        return false
    }

    #moveFood = () =>
    {
        if(this.length >= this.grid.width * this.grid.height)
        {
            this.food = new Point(-1, -1)
            return
        }

        let point = Point.random(this.grid)
        while(point.in(this.body) || point.equals(this.head)) point = Point.random(this.grid)
        this.food = point
    }

    #draw = () =>
    {
        let ctx = CANVAS.getContext('2d')
        ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)
        for(let i = 0; i < this.body.length; i++)
        {
            let current = this.body[i]
        
            let front = this.body[(i + this.body.length + 1) % this.body.length]
            let frontEdge = current.adjacentTo(front)
        
            let back = this.body[(i + this.body.length - 1) % this.body.length]
            let backEdge = current.adjacentTo(back)
        
            this.grid.tiles[Point.toIndex(this.body[i].x, this.body[i].y, this.grid)].drawTile(Snake.snakeColor, [frontEdge, backEdge])
        }
        if(!this.food.equals(new Point(-1, -1))) this.grid.get(this.food).drawTile(Snake.foodColor)
    }
}

const hamiltonian = (grid, drawPath=false, acuracy=0.4, step=40) =>
{
    const findPath = () =>
    {
        const seperate = () =>
        {
            const reduce = (n, array=[]) =>
            {
                switch(n)
                {
                    case 0:
                        return array
                    case 2:
                        array.push(n)
                        return reduce(n - 2, array)
                    case 4:
                        array.push(n)
                        return reduce(n - 4, array)
                    case 6:
                        array.push(n)
                        return reduce(n - 6, array)
                    case 8:
                        array.push(4)
                        return reduce(n - 4, array)
                    default:
                        array.push(6)
                        return reduce(n - 6, array)
                }
            }

            if((grid.width % 2 == 1) || (grid.height % 2 == 1)) return false

            let width = reduce(grid.width)
            let height = reduce(grid.height)

            let layout = []

            for(let i = 0; i < width.length; i++)
            {
                layout[i] = []

                for(let j = 0; j < height.length; j++)
                {
                    layout[i][j] = new Grid(width[i], height[j])
                }
            }

            return layout
        }

        const generateHamiltonian = (_grid) =>
        {
            let path = []

            const valid = (vertex) =>
            {
                if(!vertex.within(_grid)) return false
                if(!vertex.adjacentTo(path[0])) return false
                if(vertex.in(path)) return false
                return true
            }
    
            const cycle = (vertex) =>
            {
                if(path.length == _grid.width * _grid.height)
                {
                    if(path[0].adjacentTo(path[path.length - 1]))
                    {
                        path = path.map((v) => {return Point.toIndex(v.x, v.y, _grid)})
                        return true
                    }
                    return false
                }
    
                for(let _vertex of vertex.neighbors())
                {
                    if(valid(_vertex))
                    {
                        path.unshift(_vertex)
                        if(cycle(_vertex)) return true
                        path.shift()
                    }
                }
                return false
            }
    
            path[0] = Point.random(_grid)
            return (cycle(path[0])) ? path : false
        }

        const generatePath = (layout) =>
        {
            if(layout.length == 1) return generateHamiltonian(layout[0][0])
            
            const merge = (B, A, oldGridB, oldGridA, newGrid) =>
            {
                if(A.length == 0) return B

                const connection = () =>
                {
                    for(let i = 0; i < A.length; i++)
                    {
                        for(let point of A[i].neighbors())
                        {
                            let j
                            if(j = point.in(B))
                            {
                                if(A[(i + 1) % A.length].in(B[j - 1].neighbors())) return [i, j]
                            }
                        }
                    }

                    throw false
                }

                A = A.map((n) => {return Point.fromIndex(n, oldGridA)})
                B = B.map((n) => {return Point.fromIndex(n, oldGridB)})
                B.forEach((e) => {(newGrid.width > oldGridB.width) ? e.x += oldGridA.width : e.y += oldGridA.height})

                let [n, m] = connection()
                let path = []

                for(let i = 0; i < A.length; i++)
                {
                    path.push(Point.toIndex(A[i].x, A[i].y, newGrid))

                    if(i == n)
                    {
                        for(let j = m, k = 0; k < B.length; j = (j + 1) % B.length, k++)
                        {
                            path.push(Point.toIndex(B[j].x, B[j].y, newGrid))
                        }
                    }
                }

                return path
            }

            try
            {
                let finalPath = []
                let finalGrid = new Grid(0, grid.height)

                for(let i = 0; i < layout.length; i++)
                {
                    let pathLayer = []
                    let gridLayer = new Grid(layout[i][0].width, 0)

                    for(let j = 0; j < layout[i].length; j++)
                    {
                        while(true)
                        {
                            try
                            {
                                pathLayer = merge(generateHamiltonian(layout[i][j]), pathLayer, layout[i][j], gridLayer, new Grid(layout[i][j].width, layout[i][j].height + gridLayer.height))
                                gridLayer = new Grid(layout[i][j].width, layout[i][j].height + gridLayer.height)
                                break
                            }
                            catch(e) {continue}
                        }
                    }

                    try
                    {
                        finalPath = merge(pathLayer, finalPath, gridLayer, finalGrid, new Grid(finalGrid.width + gridLayer.width, grid.height))
                        finalGrid = new Grid(finalGrid.width + gridLayer.width, grid.height)
                    }
                    catch(e) {i--}
                }

                return finalPath
            }
            catch(e)
            {
                return generatePath(layout)
            }
        }

        let layout = seperate()
        return generatePath(layout)
    }

    let path = findPath()
    let snake = new Snake(grid)

    const draw = () =>
    {
        for(let i = 0; i < path.length; i++)
        {
            let current = Point.fromIndex(path[i], grid)
        
            let front = Point.fromIndex(path[(i + path.length + 1) % path.length], grid)
            let frontEdge = current.adjacentTo(front)
        
            let back = Point.fromIndex(path[(i + path.length - 1) % path.length], grid)
            let backEdge = current.adjacentTo(back)
        
            grid.tiles[path[i]].drawPath([frontEdge, backEdge])
        }
    }

    const move = () =>
    {
        const distance = (A, B) =>
        {
            let indexA = path.indexOf(Point.toIndex(A.x, A.y, grid))
            let indexB = path.indexOf(Point.toIndex(B.x, B.y, grid))
            return (indexB - indexA + path.length) % path.length
        }

        const distanceToSnake = (point) =>
        {
            return Math.min(...snake.body.map((segment) => {return distance(point, segment)}))
        }

        let forward = snake.head.adjacentTo(Point.fromIndex(path[(path.indexOf(Point.toIndex(snake.head.x, snake.head.y, snake.grid)) + path.length + 1) % path.length], grid))

        let direction, best = [0, path.length]
        for(let neighbor of snake.head.neighbors())
        {
            if(!neighbor.within(grid)) continue
            if(distanceToSnake(neighbor) < snake.length * acuracy) continue 
            
            if(best[1] > distance(neighbor, snake.food)) best = [snake.head.adjacentTo(neighbor), distance(neighbor, snake.food)]
        }

        direction = (best[0] != 0) ? best[0] : forward
        switch(direction)
        {
            case 1:
                if(snake.up()) location.reload()
                break
            case 2:
                if(snake.right()) location.reload()
                break
            case 3:
                if(snake.down()) location.reload()
                break
            case 4:
                if(snake.left()) location.reload()
                break
        }

        if(drawPath) draw()
    }

    setInterval(move, step)
}

const setup = () =>
{
    let width = ~~(screen.width / Tile.length) >> 1 << 1
    let height = ~~(screen.height / Tile.length) >> 1 << 1
    CANVAS.width = width * Tile.length
    CANVAS.height = height * Tile.length
    return new Grid(width, height)
}

hamiltonian(setup())