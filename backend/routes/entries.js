const express = require("express");
const router = express.Router();
const db = require("../db");
const ALLOWED_NOTE_COLORS = new Set([
  "#F8F4E3",
  "#E8F3E8",
  "#E7F0FA",
  "#F7E7E3",
  "#EFE7FA",
  "#F2F2F2",
]);

function normalizeNoteColor(noteColor) {
  return ALLOWED_NOTE_COLORS.has(noteColor) ? noteColor : "#F8F4E3";
}

function normalizeNote(note) {
  return typeof note === "string" ? note.trim() : "";
}

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
  const { title, note, type, rating, date, imageUrl, noteColor } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  db.run(
    `INSERT INTO entries (title, note, type, rating, date, imageUrl, noteColor, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      title,
      normalizeNote(note),
      type,
      rating,
      date,
      imageUrl,
      normalizeNoteColor(noteColor),
    ],
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

router.put("/:id", (req, res) => {
  const { title, note, type, rating, date, imageUrl, noteColor } = req.body;
  const { id } = req.params;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  db.run(
    `UPDATE entries
     SET title = ?, note = ?, type = ?, rating = ?, date = ?, imageUrl = ?, noteColor = ?
     WHERE id = ?`,
    [
      title,
      normalizeNote(note),
      type,
      rating,
      date,
      imageUrl,
      normalizeNoteColor(noteColor),
      id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to update entry." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Entry not found." });
      }

      db.get("SELECT * FROM entries WHERE id = ?", [id], (selectErr, row) => {
        if (selectErr) {
          return res.status(500).json({ error: "Entry updated but could not be loaded." });
        }

        res.json(row);
      });
    }
  );
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM entries WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Delete failed" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Entry not found." });
    }

    res.json({ success: true, deleted: this.changes });
  });
});

module.exports = router;
