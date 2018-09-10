const path = require('path');
const { Database } = require('sqlite3').verbose();
const fs = require('fs');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

const dbPath = process.env.DB_FILE;
const logPath = path.join(__dirname, '..', 'games.log');

start();

async function start() {
  const db = new Database(dbPath);
  const log = (await getLog()).split('\n');
  const TOKEN_PATTERN = new RegExp(/^[ 0-9]+:\d{2} (?<type>\w+): ?(?<payload>.*)?$/);
  const KILL_PATTERN = new RegExp(/^\d+ \d+ \d+: (?<killer>.*) killed (?<victim>.*) by (?<obit>.*)$/);
  const games = [];
  let game;

  log.forEach(l => {
    const match = TOKEN_PATTERN.exec(l);
    if (match === null) return;

    switch (match.groups.type) {
      case 'Kill':
        const killMatch = KILL_PATTERN.exec(match.groups.payload);
        game.kills.push(killMatch.groups); // it contains killer, victim and mean of death
        break;
      case 'InitGame':
        game = { kills: [] }; // start game with no kills
        games.push(game);
        break;
      default:
        // not known or irrelevant token
        break;
    }
  });

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    games.forEach((game) => {
      db.run('INSERT INTO games DEFAULT VALUES', function (err) {
        if (err) throw err;
        game.kills.forEach(({ killer, victim, obit }, i) => {
          db.run(
            'INSERT INTO game_kills (killer, victim, mean_of_death, game_id) VALUES (?, ?, ?, ?)', [
            killer,
            victim,
            obit,
            this.lastID,
          ], (err) => {
            if (err) throw err;
            console.log(`Inserted kill#${i} of game#${this.lastID}`);
          });
        });
      });
    });
    db.run('COMMIT');
  });
}

function getLog() {
  return new Promise((resolve, reject) => {
    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
  });
}
