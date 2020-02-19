const { Engine, Render, Runner, World, Bodies } = Matter;

// Config
const cells = 3;
const width = 600;
const height = 600;

const unitLength = width / cells;

// Creates new engine
const engine = Engine.create();

// New World is Created with engine
const { world } = engine;

// Takes in where where to add element, what engine to use, and other options
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width,
        height
    }
});

// Run our render object
Render.run(render);

// Start the Runner, connects world to engine
Runner.run(Runner.create(), engine)

// Walls
const walls = [
    Bodies.rectangle( width/2, 0, width, 40, {isStatic: true} ),
    Bodies.rectangle( width/2, height, width, 40, {isStatic: true} ),
    Bodies.rectangle( 0, height/2, 40, height, {isStatic: true} ),
    Bodies.rectangle( width, height/2, 40, height, {isStatic: true} )
];
World.add(world, walls);

// ===============
// Maze Generation
// ===============

const shuffle = arr => {
    let counter = arr.length;
    
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    };
    return arr;
};

// grid will track which units we have already traversed
const grid = Array(cells)
                .fill(null)
                .map(el => Array(cells).fill(false));

// Verticals will track all vertical walls
// --------------------------------------------
// |            |               |             |
// |            *               *             |
// |            |               |             |
// |-------------------------------------------
// |            |               |             |
// |            *               *             |
// |            |               |             |
// |------------------------------------------|
// |            |               |             |
// |            *               *             |
// |            |               |             |
// --------------------------------------------

const verticals = Array(cells)
                    .fill(null)
                    .map(el => Array(cells-1).fill(false));

// Horizontals will track all horizontal walls
// --------------------------------------------
// |            |               |             |
// |            |               |             |
// |            |               |             |
// |-----*--------------*--------------*-------
// |            |               |             |
// |            |               |             |
// |            |               |             |
// |-----*--------------*--------------*------|
// |            |               |             |
// |            |               |             |
// |            |               |             |
// --------------------------------------------
            
const horizontals = Array(cells-1)
                        .fill(null)
                        .map(el => Array(cells).fill(false));
                        
// Starting Position
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);


const stepThroughCell = (row, column) => {
    // If I have visited the cell at (row, column) then return
    if (grid[row][column]) return;
    
    // Mark this cell as being visited
    grid[row][column] = true;
    
    // Assemble randomly-ordered list of neighbros
    const neighbors = shuffle([
        // Top
        [row - 1, column, 'up'],
        // Right
        [row, column + 1, 'right'],
        // Bottom
        [row + 1, column, 'down'],
        //Left
        [row, column - 1, 'left']
    ]);

    // For each neighbor...
    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
    
    // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cells || 
            nextColumn < 0 || nextColumn >= cells) continue;
    
    // If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) continue;
    // Remove a wall from either horizontals or verticals
        if (direction === 'left') verticals[row][column - 1] = true
        else if (direction === 'right') verticals[row][column] = true;
        else if (direction === 'up') horizontals[row-1][column] = true;
        else if (direction === 'down') horizontals[row][column] = true;
    
        stepThroughCell(nextRow, nextColumn);
    };
    
    // Visit that next cell
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength/2,
            rowIndex * unitLength + unitLength/2,
            unitLength,
            10,
            { isStatic: true }
        );
        
        World.add(world, wall);
    });
});