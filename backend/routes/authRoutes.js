const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Naye users ke liye hashing rehne dete hain (security ke liye)
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "member"],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.status(201).json({
          message: "User registered successfully",
          userId: result.insertId
        });
      }
    );
  });
});

// ✅ Login (UPDATED FOR YOUR PASSWORD)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = results[0];

      // --- SAMVIDHAAN LOGIC START ---
      // Pehle check karega ki kya ye seedha "Mobashshir@201" hai?
      // Agar nahi, toh purana hashed password check karega.
      let isMatch = (password === user.password); 

      if (!isMatch) {
        // Agar plain match nahi hua, toh bcrypt se check karega
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            isMatch = false;
        }
      }
      // --- SAMVIDHAAN LOGIC END ---

      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        "secretkey",
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  );
});

module.exports = router;