const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Config
const cellsHorizontal = 5;
const cellsVertical = 5;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

// Creates new engine
const engine = Engine.create();
engine.world.gravity.y = 0;

// New World is Created with engine
const { world } = engine;

// Takes in where where to add element, what engine to use, and other options
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
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
    Bodies.rectangle( width/2, 0, width, 2, {isStatic: true} ),
    Bodies.rectangle( width/2, height, width, 2, {isStatic: true} ),
    Bodies.rectangle( 0, height/2, 2, height, {isStatic: true} ),
    Bodies.rectangle( width, height/2, 2, height, {isStatic: true} )
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
const grid = Array(cellsVertical)
                .fill(null)
                .map(el => Array(cellsHorizontal).fill(false));

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

const verticals = Array(cellsVertical)
                    .fill(null)
                    .map(el => Array(cellsHorizontal-1).fill(false));

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
            
const horizontals = Array(cellsVertical-1)
                        .fill(null)
                        .map(el => Array(cellsHorizontal).fill(false));
                        
// Starting Position
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);


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
        if (nextRow < 0 || nextRow >= cellsVertical || 
            nextColumn < 0 || nextColumn >= cellsHorizontal) continue;
    
    // If we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) continue;
    // Remove a wall from either horizontals or verticals
        if (direction === 'left') verticals[row][column - 1] = true
        else if (direction === 'right') verticals[row][column] = true;
        else if (direction === 'up') horizontals[row-1][column] = true;
        else if (direction === 'down') horizontals[row][column] = true;
    
    // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
    };
    
    
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX/2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            { 
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) return;
        
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY/2,
            5,
            unitLengthY,
            { 
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        
        World.add(world, wall);
    });
});

// Goal

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7, 
    { 
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    { 
        label: 'ball',
        render: {
            fillStyle: 'blue'
        }
    }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
   const { x, y } = ball.velocity;

   if (event.keyCode === 87) Body.setVelocity(ball, { x, y: y - 5});
   if (event.keyCode === 68) Body.setVelocity(ball, { x: x + 5, y});
   if (event.keyCode === 83) Body.setVelocity(ball, { x, y: y + 5});
   if (event.keyCode === 65) Body.setVelocity(ball, { x: x - 5, y});
});

// Win Condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];
        
        if (
            labels.includes(collision.bodyA.label) && 
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                };
            });
            
        };
    });
});