const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to SQLite DB.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      note TEXT,
      type TEXT,
      rating TEXT,
      date TEXT,
      imageUrl TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.all("PRAGMA table_info(entries)", [], (err, columns) => {
    if (err) {
      console.error("Failed to inspect entries schema.", err.message);
      return;
    }

    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has("imageUrl")) {
      db.run("ALTER TABLE entries ADD COLUMN imageUrl TEXT", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add imageUrl column.", alterErr.message);
        }
      });
    }

    if (!columnNames.has("createdAt")) {
      db.run("ALTER TABLE entries ADD COLUMN createdAt TEXT", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add createdAt column.", alterErr.message);
          return;
        }

        db.run(
          "UPDATE entries SET createdAt = CURRENT_TIMESTAMP WHERE createdAt IS NULL",
          (updateErr) => {
            if (updateErr) {
              console.error("Failed to backfill createdAt column.", updateErr.message);
            }
          }
        );
      });
    }
  });
});

module.exports = db;
