const robot = require('robotjs');

console.log("Move your mouse to the desired spot. Coordinates will print every half second. Press Ctrl+C to stop.");

setInterval(() => {
  const pos = robot.getMousePos();
  console.log(`x: ${pos.x}, y: ${pos.y}`);
}, 500);