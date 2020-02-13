const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

const width = 800;
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
        wireframes: false,
        width,
        height
    }
});

// Run our render object
Render.run(render);

// Start the Runner, connects world to engine
Runner.run(Runner.create(), engine)

World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}))

// Walls
const walls = [
    Bodies.rectangle( 400, 0, 800, 40, {isStatic: true} ),
    Bodies.rectangle( 400, 600, 800, 40, {isStatic: true} ),
    Bodies.rectangle( 0, 300, 40, 600, {isStatic: true} ),
    Bodies.rectangle( 800, 300, 40, 600, {isStatic: true} )
];
World.add(world, walls);

// Random Shapes
for (let i=0; i<20; i++) {
    if (Math.random() > 0.5) {
        World.add(
            world, 
            Bodies.rectangle( Math.random() * width, Math.random() * height, 40, 40)
        );
    } else {
        World.add(
            world, 
            Bodies.circle( Math.random() * width, Math.random() * height, 40, 40)
        );
    };
};

