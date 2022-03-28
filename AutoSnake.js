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

    neighbors = (random=false) =>
    {
        let neighbors = [this.up(), this.right(), this.down(), this.left()]
        return (random) ? neighbors.sort((a, b) => {return 0.5 - Math.random()}) : neighbors
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
        for(let point of points) if(this.equals(point)) return true
    }

    within = (grid) =>
    {
        return (this.x > -1) && (this.x < grid.width) && (this.y > -1) && (this.y < grid.height)
    }

    static toIndex = (point, grid) =>
    {
        return (point.y * grid.width) + point.x
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

    constructor(index, grid)
    {
        this.point = Point.fromIndex(index, grid)
    }

    drawSnake = (edges) =>
    {
        const X = (this.point.x * Tile.length) + (Tile.length / 2)
        const Y = (this.point.y * Tile.length) + (Tile.length / 2)
        const RADIUS = Tile.length * 0.25

        /* Draw one edge of the tile. */
        const draw = (edge) =>
        {
            let ctx = CANVAS.getContext('2d')
            ctx.beginPath()
            ctx.fillStyle = Snake.snakeColor
    
            ctx.arc(X, Y, RADIUS, 0, 2 * Math.PI)
    
            let x, y, width, height
            switch(edge)
            {
                case 1:
                    x = X - RADIUS
                    y = Y - (Tile.length / 2)
                    width = RADIUS * 2
                    height = (Tile.length) / 2
                    ctx.rect(x, y, width, height)
                    break
                case 2:
                    x = X
                    y = Y - RADIUS
                    width = (Tile.length) / 2
                    height = RADIUS * 2
                    ctx.rect(x, y, width, height)
                    break
                case 3:
                    x = X - RADIUS
                    y = Y
                    width = RADIUS * 2
                    height = (Tile.length) / 2
                    ctx.rect(x, y, width, height)
                    break
                case 4:
                    x = X - (Tile.length / 2)
                    y = Y - RADIUS
                    width = (Tile.length) / 2
                    height = RADIUS * 2
                    ctx.rect(x, y, width, height)
                    break
            }
            
            ctx.fill()
        }

        for(let edge of edges) draw(edge)
       
        /* If there is a corner round it out. */
        let frame1 = edges[0] == edges[1]
        let frontOrBack = edges.includes(null)
        let corner = (edges[0] + 2) % 4 != edges[1] % 4
        if(!frame1 && !frontOrBack && corner)
        {
            let ctx = CANVAS.getContext('2d')
            ctx.beginPath()
            ctx.fillStyle = Snake.snakeColor

            let xArc = (edges.includes(2)) ? X + (RADIUS * 2) : X - (RADIUS * 2)
            let yArc = (edges.includes(1)) ? Y - (RADIUS * 2) : Y + (RADIUS * 2)
            let angle = ((edges.includes(1)) ? ((edges.includes(2)) ? 1 : 4) : ((edges.includes(2)) ? 2 : 3)) * Math.PI / 2

            ctx.moveTo(X, Y)
            ctx.arc(xArc, yArc, RADIUS, angle, angle + Math.PI / 2)
            ctx.closePath()
            ctx.fill()
        }
    }

    drawFood = () =>
    {
        const X = (this.point.x * Tile.length) + (Tile.length / 2)
        const Y = (this.point.y * Tile.length) + (Tile.length / 2)
        const RADIUS = Tile.length * 0.3

        let ctx = CANVAS.getContext('2d')
        ctx.beginPath()
        ctx.fillStyle = Snake.foodColor
        ctx.arc(X, Y, RADIUS, 0, 2 * Math.PI)
        ctx.fill()
    }

    drawPath = (edges) =>
    {
        const X = (this.point.x * Tile.length) + (Tile.length / 2)
        const Y = (this.point.y * Tile.length) + (Tile.length / 2)
        const RADIUS = Tile.length * 0.15

        /* Draw one edge of the tile. */
        const draw = (edge) =>
        {
            let ctx = CANVAS.getContext('2d')
            ctx.beginPath()
            ctx.fillStyle = '#444444'
    
            ctx.arc(X, Y, RADIUS, 0, 2 * Math.PI)
    
            let x, y, width, height
            switch(edge)
            {
                case 1:
                    x = X - (RADIUS / 4)
                    y = Y - (Tile.length / 2)
                    width = RADIUS / 2
                    height = (Tile.length) / 2
                    ctx.rect(x, y, width, height)
                    break
                case 2:
                    x = X
                    y = Y - (RADIUS / 4)
                    width = (Tile.length) / 2
                    height = RADIUS / 2
                    ctx.rect(x, y, width, height)
                    break
                case 3:
                    x = X - (RADIUS / 4)
                    y = Y
                    width = RADIUS / 2
                    height = (Tile.length) / 2
                    ctx.rect(x, y, width, height)
                    break
                case 4:
                    x = X - (Tile.length / 2)
                    y = Y - (RADIUS / 4)
                    width = (Tile.length) / 2
                    height = RADIUS / 2
                    ctx.rect(x, y, width, height)
                    break
            }
            
            ctx.fill()
        }

        for(let edge of edges) draw(edge)
    }
}

class Grid
{
    constructor(width, height)
    {
        this.width = width
        this.height = height
        this.tiles = new Array(width * height)
        for(let i = 0; i < this.tiles.length; i++) this.tiles[i] = new Tile(i, this)
    }

    get = (point) =>
    {
        return this.tiles[Point.toIndex(point, this)]
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
        /* Return if the snake moved into itself. */
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
        if(this.length > this.grid.width * this.grid.height) this.food = new Point(-1, -1)
        else
        {
            while(this.food.in(this.body) || this.food.equals(this.head)) this.food = Point.random(this.grid)
        }
    }

    #draw = () =>
    {
        let ctx = CANVAS.getContext('2d')
        ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)

        for(let i = 0; i < this.body.length; i++)
        {
            let current = this.body[i]
        
            let front = this.body[(i + 1)]
            let frontEdge = (front) ? current.adjacentTo(front) : null
        
            let back = this.body[(i - 1)]
            let backEdge = (back) ? current.adjacentTo(back) : null
        
            this.grid.tiles[Point.toIndex(this.body[i], this.grid)].drawSnake([frontEdge, backEdge])
        }

        if(!this.food.equals(new Point(-1, -1))) this.grid.get(this.food).drawFood()
    }
}

const hamiltonian = (grid, drawPath=false, acuracy=0.4, step=40) =>
{
    const findPath = () =>
    {
        /* Seperate the grid so the algorithm makes multiple 4x4, 4x6 and 6x6 grids. */
        const seperate = () =>
        {
            /* Reduce an even number to groupings of 2, 4 and 6. */
            const reduce = (n, array=[]) =>
            {
                switch(n)
                {
                    case 0:
                        return array
                    case 2:
                        array.push(2)
                        return reduce(n - 2, array)
                    case 4:
                        array.push(4)
                        return reduce(n - 4, array)
                    case 6:
                        array.push(6)
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

            /* Check if a point is within the grid bounds, is next to the previously added point, and is not already in the path. */
            const valid = (vertex) =>
            {
                if(!vertex.within(_grid)) return false
                if(!vertex.adjacentTo(path[0])) return false
                if(vertex.in(path)) return false
                return true
            }
    
            /* Generate the path if one exists. */
            const cycle = (vertex) =>
            {
                if(path.length == _grid.width * _grid.height)
                {
                    if(path[0].adjacentTo(path[path.length - 1]))
                    {
                        path = path.map((v) => {return Point.toIndex(v, _grid)})
                        return true
                    }

                    return false
                }
    
                for(let _vertex of vertex.neighbors(true))
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
            
            /* Merge hamiltonian path B into hamiltonian path A. */
            const merge = (B, A, oldGridB, oldGridA, newGrid) =>
            {
                if(A.length == 0) return B

                /* Find a point in path A that is adjacent to a point in path B. */
                const connection = () =>
                {
                    for(let i = 0; i < A.length; i++)
                    {
                        for(let point of A[i].neighbors())
                        {  
                            if(point.in(B))
                            {
                                let j = B.findIndex((e) => {return e.equals(point)})
                                if(A[(i + 1) % A.length].in(B[j - 1].neighbors())) return [i, j]
                                /* i is the index of the connection in path A.
                                   j is the index of the connection in path B. */
                            }
                        }
                    }

                    throw false
                }

                A = A.map((n) => {return Point.fromIndex(n, oldGridA)})
                B = B.map((n) => {return Point.fromIndex(n, oldGridB)})
                B.forEach((e) => {(newGrid.width > oldGridB.width) ? e.x += oldGridA.width : e.y += oldGridA.height})

                /* n is the index of the connection in path A.
                   m is the index of the connection in path B. */
                let [n, m] = connection()
                let path = []

                for(let i = 0; i < A.length; i++)
                {
                    path.push(Point.toIndex(A[i], newGrid))

                    if(i == n)
                    {
                        for(let j = m, k = 0; k < B.length; j = (j + 1) % B.length, k++)
                        {
                            path.push(Point.toIndex(B[j], newGrid))
                        }
                    }
                }

                return path
            }

            /* Create and merge paths top -> bottom, left -> right. */
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
                        /* Attempt to add a row to current column. */
                        try
                        {
                            pathLayer = merge(generateHamiltonian(layout[i][j]), pathLayer, layout[i][j], gridLayer, new Grid(layout[i][j].width, layout[i][j].height + gridLayer.height))
                            gridLayer = new Grid(layout[i][j].width, layout[i][j].height + gridLayer.height)
                            break
                        }
                        /* Remake the row until it is able to connect. */
                        catch(e) {continue}
                    }
                }

                /* Atempt to add a column to the final path. */
                try
                {
                    finalPath = merge(pathLayer, finalPath, gridLayer, finalGrid, new Grid(finalGrid.width + gridLayer.width, grid.height))
                    finalGrid = new Grid(finalGrid.width + gridLayer.width, grid.height)
                }
                /* Remake the column until it is able to connect. */
                catch(e) {i--}
            }

            return finalPath

        }

        let layout = seperate()
        return generatePath(layout)
    }

    let path = findPath()
    let snake = new Snake(grid)

    /* Draw the path. */
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
            let indexA = path.indexOf(Point.toIndex(A, grid))
            let indexB = path.indexOf(Point.toIndex(B, grid))
            return (indexB - indexA + path.length) % path.length
        }

        const distanceToSnake = (point) =>
        {
            return Math.min(...snake.body.map((segment) => {return distance(point, segment)}))
        }

        /* Get the point that is one step forward in the path from the snake's head. */
        let forward = snake.head.adjacentTo(Point.fromIndex(path[(path.indexOf(Point.toIndex(snake.head, snake.grid)) + path.length + 1) % path.length], grid))

        /* Determain if the snake can take any shortcuts in the path. */
        let best = [0, path.length]
        for(let neighbor of snake.head.neighbors())
        {
            if(!neighbor.within(grid)) continue
            if(distanceToSnake(neighbor) < snake.length * acuracy) continue 
            
            if(best[1] > distance(neighbor, snake.food)) best = [snake.head.adjacentTo(neighbor), distance(neighbor, snake.food)]
        }

        let direction = (best[0]) ? best[0] : forward
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
    let width = ~~(window.innerWidth / Tile.length) >> 1 << 1
    let height = ~~(window.innerHeight / Tile.length) >> 1 << 1
    CANVAS.width = width * Tile.length
    CANVAS.height = height * Tile.length
    return new Grid(width, height)
}

hamiltonian(setup())