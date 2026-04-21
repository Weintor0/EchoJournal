const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all entries
router.get("/", (req, res) => {
  const rawLimit = Number.parseInt(req.query.limit, 10);
  const hasLimit = Number.isInteger(rawLimit) && rawLimit > 0;
  const sql = hasLimit
    ? "SELECT * FROM entries ORDER BY COALESCE(datetime(createdAt), datetime('1970-01-01')) DESC, id DESC LIMIT ?"
    : "SELECT * FROM entries ORDER BY COALESCE(datetime(createdAt), datetime('1970-01-01')) DESC, id DESC";
  const params = hasLimit ? [rawLimit] : [];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch entries." });
    }

    res.json(rows);
  });
});

// GET single entry
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM entries WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch entry." });
    }

    if (!row) {
      return res.status(404).json({ error: "Entry not found." });
    }

    res.json(row);
  });
});

router.post("/", (req, res) => {
  const { title, note, type, rating, date, imageUrl } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  db.run(
    `INSERT INTO entries (title, note, type, rating, date, imageUrl, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [title, note, type, rating, date, imageUrl],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to create entry." });
      }

      db.get("SELECT * FROM entries WHERE id = ?", [this.lastID], (selectErr, row) => {
        if (selectErr) {
          return res.status(500).json({ error: "Entry created but could not be loaded." });
        }

        res.status(201).json(row);
      });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM entries WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete entry." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Entry not found." });
    }

    res.json({ success: true });
  });
});

module.exports = router;
