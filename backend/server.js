const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware: Set HTTP headers
app.use(helmet());

// Security Middleware: Configure CORS to restrict domains in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL 
        : '*', // Allow all in dev, restrict in prod
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security Middleware: Limit JSON payload size to prevent DOS
app.use(express.json({ limit: '10kb' }));

// Security Middleware: Rate Limiter to prevent brute-force / spam
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/tasks', apiLimiter);

// Database connection
const dbPath = path.resolve(__dirname, '../database/tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Initialize table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT,
            status TEXT DEFAULT 'Pending'
        )`);
    }
});

// Basic check route
app.get('/', (req, res) => {
    res.send('Student Task Manager API is running.');
});

// API ROUTE: GET all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            console.error('Database Error:', err.message); // Information kept internal
            res.status(500).json({ error: 'Internal Server Error' }); // Generic production response
            return;
        }
        res.json(rows);
    });
});

// API ROUTE: POST a new task
app.post('/tasks', (req, res) => {
    const { title, description, due_date } = req.body;
    
    // Server-side Input Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Valid title is required' });
    }
    if (title.length > 255) {
        return res.status(400).json({ error: 'Title exceeds maximum length of 255 characters' });
    }
    if (description && description.length > 1000) {
        return res.status(400).json({ error: 'Description exceeds maximum length of 1000 characters' });
    }
    
    const sql = 'INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)';
    const params = [title.trim(), description ? description.trim() : null, due_date || null];
    
    // Parameterized queries used here to prevent SQL injection
    db.run(sql, params, function (err) {
        if (err) {
            console.error('Database Error:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.status(201).json({ id: this.lastID, title, description, due_date, status: 'Pending' });
    });
});

// API ROUTE: PUT update a task
app.put('/tasks/:id', (req, res) => {
    const { title, description, due_date, status } = req.body;
    const { id } = req.params;
    
    // Optional Input Validation bounds
    if (title && title.length > 255) return res.status(400).json({ error: 'Title too long' });
    if (description && description.length > 1000) return res.status(400).json({ error: 'Description too long' });
    if (status && !['Pending', 'Completed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const sql = 'UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), due_date = COALESCE(?, due_date), status = COALESCE(?, status) WHERE id = ?';
    const params = [title, description, due_date, status, id];
    
    db.run(sql, params, function (err) {
        if (err) {
            console.error('Database Error:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json({ message: `Task ${id} updated`, changes: this.changes });
    });
});

// API ROUTE: DELETE a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ?', id, function (err) {
        if (err) {
            console.error('Database Error:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: `Task ${id} deleted successfully`, changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
