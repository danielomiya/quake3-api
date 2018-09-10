const { Database } = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

const dbPath = process.env.DB_FILE;
const db = new Database(dbPath);
require('../utils/promisify-sqlite')(db);

start();

async function start() {
  const games = await db.getAsync('SELECT COUNT(*) AS n FROM games');
  const gameKills = await db.getAsync('SELECT COUNT(*) AS n FROM game_kills');
  console.log(`Table \`games\` has ${games['n']} rows`);
  console.log(`Table \`game_kills\` has ${gameKills['n']} rows`);
}
