const puppeteer = require('puppeteer');
const robot = require('robotjs');

// === CONFIGURATION ===
const liveToken = '6H6MELoYaQKi7oXvKDMrganWu2snVL8JLaGZk1jVpump';
const updateTime = 500; // Time between checking for new messages in milliseconds
const VOTING_MODE = true; // Set to false for direct mode
const VOTING_TIME_MS = 2000; // Voting window in milliseconds
const CAPTURABLE_WORDS = [
  'up', 'down', 'left', 'right', 'wait', 'undo', 'restart', 'back', 'confirm'
];

// Map commands to keys
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
        // Only process if message is exactly a capturable word (case-insensitive, trimmed)
        const command = msg.text?.trim().toLowerCase();
        if (CAPTURABLE_WORDS.includes(command)) {
          if (VOTING_MODE) {
            voteCounts[command] = (voteCounts[command] || 0) + 1;
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
