const express = require('express');
const cors = require('cors');
const app = express();

// Database Connection (Ise dhyan se check karein ki file path sahi ho)
const db = require('./config/db'); 

// ✅ Routes Import
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use(cors());
app.use(express.json());

// ✅ API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ DASHBOARD STATS ROUTE (Naya)
app.get('/api/dashboard/stats', (req, res) => {
    const q = `
        SELECT 
            (SELECT COUNT(*) FROM tasks) as totalTasks,
            (SELECT COUNT(*) FROM users) as totalUsers,
            (SELECT COUNT(*) FROM projects) as totalProjects
    `;
    db.query(q, (err, data) => {
        if (err) {
            console.error("Dashboard DB Error:", err);
            return res.status(500).json({ error: "Query failed", details: err });
        }
        res.json(data[0]);
    });
});

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});