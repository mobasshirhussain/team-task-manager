const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const verifyToken = require('../middleware/authMiddleware');

// ✅ 1. Create Task (With due_date and priority)
router.post("/", verifyToken, (req, res) => {
  const { title, description, project_id, assigned_to, due_date, priority } = req.body;
  const created_by = req.user.id;

  const query = `
    INSERT INTO tasks (title, description, project_id, assigned_to, created_by, due_date, priority) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [title, description, project_id, assigned_to, created_by, due_date, priority],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json(err);
      }
      res.json({
        message: "Task created successfully with all fields!",
        taskId: result.insertId
      });
    }
  );
});

// ✅ 2. Dashboard Statistics (Assignment Requirement)
// Isse Total, Todo, Done aur Overdue tasks ka count milega
router.get("/stats/dashboard", verifyToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      COUNT(*) AS totalTasks,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todoCount,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressCount,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS doneCount,
      SUM(CASE WHEN due_date < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) AS overdueCount
    FROM tasks 
    WHERE assigned_to = ? OR created_by = ?;
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error("Dashboard Error:", err);
      return res.status(500).json(err);
    }
    res.json(results[0]);
  });
});

// ✅ 3. Get All Tasks (Reference ke liye)
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;
  const query = "SELECT * FROM tasks WHERE assigned_to = ? OR created_by = ?";
  
  db.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;