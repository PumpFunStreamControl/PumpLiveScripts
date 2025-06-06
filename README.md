# PumpChatWatch Project

## Overview
This project enables chat-driven control of games or applications by capturing chat commands and simulating keyboard or mouse input. It is designed for interactive experiences such as Twitch Plays-style games, with a focus on Minesweeper and similar grid-based games.

---

## File Descriptions

### `mineChat.js`
- **Purpose:**
  - Listens to chat messages on a Pump.fun coin page and interprets them as grid coordinates (e.g., `A1`, `B10`, `P16`) or the special command `RESET`.
  - Simulates mouse clicks on a Minesweeper grid based on the received commands, or clicks the smiley face to reset the game.
  - Supports both direct and voting modes for command execution.
- **Usage:**
  - Configure the grid calibration values in the script for your Minesweeper window.
  - Run with `node mineChat.js`.
  - Send grid coordinates (with or without spaces, e.g., `A10` or `A 10`) or `RESET` in chat to interact with the game.

### `scrapeChat.js`
- **Purpose:**
  - The original chat-to-keyboard script for Pump.fun.
  - Listens for simple commands (`up`, `down`, `left`, `right`, etc.) and simulates keyboard input accordingly.
  - Supports both direct and voting modes for command execution.
- **Usage:**
  - Run with `node scrapeChat.js`.
  - Send supported commands in chat to control the target application.

### `calibrateMouse.js`
- **Purpose:**
  - Utility script to help calibrate the screen coordinates for grid cells and buttons.
  - Prints the current mouse position every half second.
- **Usage:**
  - Run with `node calibrateMouse.js`.
  - Move your mouse to the desired spot and note the coordinates printed in the console.
  - Use these values to calibrate the grid in `mineChat.js`.

### `test_input.js`
- **Purpose:**
  - Test script to simulate a sequence of keyboard commands for debugging or demonstration.
- **Usage:**
  - Run with `node test_input.js`.
  - The script will simulate keypresses for a predefined set of commands.

---

## Requirements
- Node.js
- `puppeteer` and `robotjs` packages (install with `npm install puppeteer robotjs`)

---

## Notes
- Voting mode can be toggled in the scripts for collaborative play.

- 5fsL7xPLuEop4PxaGQeaEgtA29tAiEeo7Mx59x3G2PX7
