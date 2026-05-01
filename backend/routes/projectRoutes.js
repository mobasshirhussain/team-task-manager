const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// ✅ Create Project
router.post("/", verifyToken, (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  db.query(
    "INSERT INTO projects (name, created_by) VALUES (?, ?)",
    [name, userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Project created successfully",
        projectId: result.insertId
      });
    }
  );
});

// ✅ Get Projects
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM projects WHERE created_by = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json(results);
    }
  );
});

module.exports = router;