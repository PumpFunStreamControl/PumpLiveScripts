const robot = require('robotjs');

const COMMANDS = ['up', 'down', 'left', 'right', 'wait', 'undo', 'restart'];
const COMMAND_KEY_MAP = {
  'up': 'w',
  'down': 's',
  'left': 'a',
  'right': 'd',
  'restart': 'r',
  'back': 'z',
  'wait': 'x',
  'confirm': 'x'
};
const delay = 1000; // 1 second between commands

function simulateKeypress(command) {
  const key = COMMAND_KEY_MAP[command];
  if (key) {
    robot.keyTap(key);
    console.log(`[KEYPRESS] Simulated: ${key}`);
  } else {
    console.log(`[KEYPRESS] No key mapped for command: ${command}`);
  }
}

(async () => {
  for (const cmd of COMMANDS) {
    console.log(`Test sending: ${cmd}`);
    simulateKeypress(cmd);
    await new Promise(res => setTimeout(res, delay));
  }
  console.log('Test input complete.');
})(); 