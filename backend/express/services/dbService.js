const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../../database/student360.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to the SQLite database:", err.message);
  } else {
    console.log("Connected to the shared SQLite database at:", dbPath);
    db.run("PRAGMA foreign_keys = ON;");
  }
});

// Helper functions for promise-based SQLite calls
function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function queryGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  queryAll,
  queryGet,
  queryRun
};
