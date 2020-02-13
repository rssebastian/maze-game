const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;

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

