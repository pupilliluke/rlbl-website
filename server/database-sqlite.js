const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open database file
const dbPath = path.join(__dirname, 'rocketleague.db');
const db = new sqlite3.Database(dbPath);

// Database helper functions
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const testConnection = async () => {
  try {
    await query('SELECT 1');
    console.log('SQLite database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

// Close database connection
const closeDb = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
};

module.exports = {
  query,
  run,
  testConnection,
  closeDb,
  db
};