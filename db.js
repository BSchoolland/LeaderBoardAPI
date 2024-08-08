const sqlite3 = require("sqlite3");
const path = require("path");

// Use a file-based SQLite database
const dbPath = path.join(__dirname, "highscores.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS highscores_level1 (id INTEGER PRIMARY KEY AUTOINCREMENT, initials TEXT, score INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    db.run("CREATE TABLE IF NOT EXISTS highscores_level2 (id INTEGER PRIMARY KEY AUTOINCREMENT, initials TEXT, score INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    db.run("CREATE TABLE IF NOT EXISTS highscores_level3 (id INTEGER PRIMARY KEY AUTOINCREMENT, initials TEXT, score INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    db.run("CREATE TABLE IF NOT EXISTS highscores_level4 (id INTEGER PRIMARY KEY AUTOINCREMENT, initials TEXT, score INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

module.exports = db;