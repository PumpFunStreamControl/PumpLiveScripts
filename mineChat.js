const puppeteer = require('puppeteer');
const robot = require('robotjs');

// === CONFIGURATION ===
const liveToken = 'BPMengcLCcNxcZvT4f9QdhqCodwTskbUr25wZtFWpump';
const updateTime = 500; // Time between checking for new messages in milliseconds
const VOTING_MODE = true; // Set to false for direct mode
const VOTING_TIME_MS = 2000; // Voting window in milliseconds

// For Intermediate: 16x16 grid
const CAPTURABLE_WORDS = [];
for (let col = 'A'.charCodeAt(0); col <= 'P'.charCodeAt(0); col++) {
  for (let row = 1; row <= 16; row++) {
    CAPTURABLE_WORDS.push(`${String.fromCharCode(col)}${row}`);
  }
}
CAPTURABLE_WORDS.push('RESET');

// Function to convert grid coordinate to screen coordinates
function gridToScreenCoordinates(gridCoord) {
  if (gridCoord === 'RESET') {
    return { x: 869, y: 262 }; // Smiley button
  }
  const col = gridCoord[0].toUpperCase();
  const row = parseInt(gridCoord.slice(1));
  const x0 = 687; // A1 x
  const y0 = 315; // A1 y
  const cellSize = 24; // width between A1 and B1

  const x = x0 + (col.charCodeAt(0) - 'A'.charCodeAt(0)) * cellSize;
  const y = y0 + (row - 1) * cellSize;
  return { x, y };
}

function simulateClick(coordinates) {
  robot.moveMouse(coordinates.x, coordinates.y);
  robot.mouseClick();
  // console.log(`[CLICK] Simulated click at coordinates: (${coordinates.x}, ${coordinates.y})`);
}

function simulateKeypress(command) {
  const coordinates = gridToScreenCoordinates(command);
  simulateClick(coordinates);
}

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Set to false for debugging
  const page = await browser.newPage();
  await page.goto(`https://pump.fun/coin/${liveToken}`, { waitUntil: 'networkidle2' });

  await page.waitForSelector('div[data-message-id]');

  let lastSeenIds = new Set();
  let voteCounts = {};
  let votingTimeout = null;

  function resetVotes() {
    voteCounts = {};
    CAPTURABLE_WORDS.forEach(word => voteCounts[word] = 0);
  }

  if (VOTING_MODE) resetVotes();

  async function processMessages() {
    const messages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div[data-message-id]')).map(msg => ({
        id: msg.getAttribute('data-message-id'),
        user: msg.querySelector('a.font-semibold')?.innerText,
        walletAddress: (() => {
          const href = msg.querySelector('a.font-semibold')?.href;
          if (!href) return null;
          const parts = href.split('/');
          return parts[parts.length - 1];
        })(),
        profilePic: msg.querySelector('img.rounded-full.object-cover')?.src,
        text: msg.querySelector('p.break-words')?.innerText,
        timestamp: msg.querySelector('span.text-\\[10px\\]')?.innerText,
      }));
    });

    for (const msg of messages) {
      if (!lastSeenIds.has(msg.id)) {
        lastSeenIds.add(msg.id);
        // Process message and convert to uppercase for grid coordinates
        const command = msg.text?.replace(/\s+/g, '').trim().toUpperCase();
        if (CAPTURABLE_WORDS.includes(command)) {
          if (VOTING_MODE) {
            voteCounts[command] = (voteCounts[command] || 0) + 1;
            console.log(`[VOTE] Received vote for ${command} from ${msg.user}`);
            if (!votingTimeout) {
              votingTimeout = setTimeout(() => {
                // Find the command with the most votes
                const maxVotes = Math.max(...Object.values(voteCounts));
                const winners = Object.keys(voteCounts).filter(cmd => voteCounts[cmd] === maxVotes && maxVotes > 0);
                if (winners.length > 0) {
                  // If tie, pick randomly
                  const chosen = winners[Math.floor(Math.random() * winners.length)];
                  console.log(`[VOTE RESULT] Command: ${chosen} | Votes: ${maxVotes}`);
                  simulateKeypress(chosen);
                } else {
                  console.log('[VOTE RESULT] No valid votes this round.');
                }
                resetVotes();
                votingTimeout = null;
              }, VOTING_TIME_MS);
            }
          } else {
            // Direct mode: trigger command immediately
            console.log(`[COMMAND] ${command} from ${msg.user} (${msg.walletAddress})`);
            simulateKeypress(command);
          }
        } else {
          console.log(`[IGNORED] Message "${command}" is not a valid grid coordinate`);
        }
      }
    }
  }

  while (true) {
    await processMessages();
    await new Promise(res => setTimeout(res, `${updateTime}`));
  }

  // await browser.close(); // Don't close the browser in a live watcher
})();
