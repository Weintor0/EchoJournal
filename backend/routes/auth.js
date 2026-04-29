const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const db = require("../db");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    profilePicture: user.profilePicture ?? "",
  };
}

router.post("/register", (req, res) => {
  const name = String(req.body.name ?? "").trim();
  const surname = String(req.body.surname ?? "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password ?? "").trim();

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  db.run(
    `INSERT INTO users (name, surname, email, passwordHash, createdAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [name, surname, email, hashPassword(password)],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ error: "An account with this email already exists." });
        }

        return res.status(500).json({ error: "Failed to create account." });
      }

      db.get(
        "SELECT id, name, surname, email, profilePicture FROM users WHERE id = ?",
        [this.lastID],
        (selectErr, user) => {
          if (selectErr || !user) {
            return res.status(500).json({ error: "Account created but could not be loaded." });
          }

          res.status(201).json(toPublicUser(user));
        }
      );
    }
  );
});

router.post("/login", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password ?? "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  db.get(
    "SELECT * FROM users WHERE email = ? AND passwordHash = ?",
    [email, hashPassword(password)],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log in." });
      }

      if (!user) {
        return res.status(401).json({ error: "Email or password is incorrect." });
      }

      res.json(toPublicUser(user));
    }
  );
});

router.get("/users/:id", (req, res) => {
  db.get(
    "SELECT id, name, surname, email, profilePicture FROM users WHERE id = ?",
    [req.params.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch user." });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.json(toPublicUser(user));
    }
  );
});

router.put("/users/:id/profile-picture", (req, res) => {
  const profilePicture = String(req.body.profilePicture ?? "");

  db.run(
    "UPDATE users SET profilePicture = ? WHERE id = ?",
    [profilePicture, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to update profile picture." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      db.get(
        "SELECT id, name, surname, email, profilePicture FROM users WHERE id = ?",
        [req.params.id],
        (selectErr, user) => {
          if (selectErr || !user) {
            return res.status(500).json({
              error: "Profile picture updated but user could not be loaded.",
            });
          }

          res.json(toPublicUser(user));
        }
      );
    }
  );
});

module.exports = router;
