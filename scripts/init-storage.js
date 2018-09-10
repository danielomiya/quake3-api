const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { Database } = require('sqlite3').verbose();
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

// None of the these APIs has
// support for async/await :(

const dbPath = process.env.DB_FILE;

const scanner = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

start();

async function start() {
  try {
    if (await databaseExists()) {
      console.log('Database already exists.');

      if (!await shouldDelete()) {
        console.log('Exiting...');
        return;
      }

      await deleteDatabase();
      console.log('Database deleted.');
    }
    await createDatabase();
    console.log('Database created.');
  } catch (e) {
    console.error(e);
  }
}

function databaseExists() {
  return new Promise((resolve) => {
    fs.exists(dbPath, (exists) => {
      resolve(exists);
    });
  });
}

function shouldDelete() {
  return new Promise((resolve) => {
    scanner.question('Do you want to delete it, in order to recreate it?\n\r',
      (answer) => {
        scanner.close();
        const should = (/^(y(es|eah)?|s(im)?|true)$/i).test(answer);
        resolve(should);
      });
  });
}

function deleteDatabase() {
  return new Promise((resolve, reject) => {
    fs.unlink(dbPath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function createDatabase() {
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath);

    db.serialize(() => {
      db.run(`
        CREATE TABLE games (
          id INTEGER,
          PRIMARY KEY (id)
        );`, reject);

      db.run(`
        CREATE TABLE game_kills (
          id INTEGER,
          killer VARCHAR(50),
          victim VARCHAR(50) NOT NULL,
          mean_of_death VARCHAR(25) NOT NULL,
          game_id INTEGER NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (game_id) REFERENCES game (id)
        );`, reject);

      db.close(reject);
      resolve();
    });
  });
}
