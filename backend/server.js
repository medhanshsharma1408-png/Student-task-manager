const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware: Set HTTP headers
app.use(helmet());

// Security Middleware: Configure CORS to restrict domains in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL 
        : '*',
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

// Postgres Database Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add SSL support securely if required by hosted PostgreSQL (common on Render)
    ssl: process.env.NODE_ENV === 'production' && typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.includes('onrender') ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');
        // Initialize table natively 
        pool.query(`CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            due_date VARCHAR(50),
            status VARCHAR(50) DEFAULT 'Pending'
        )`).catch(tableErr => console.error('Error creating table:', tableErr.stack));
        release();
    }
});

// Basic check route
app.get('/', (req, res) => {
    res.send('Student Task Manager API is running.');
});

// API ROUTE: GET all tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API ROUTE: POST a new task
app.post('/tasks', async (req, res) => {
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
    
    // Postgres uses $1, $2 mapping scheme instead of SQLite's (?, ?) scheme
    const sql = 'INSERT INTO tasks (title, description, due_date) VALUES ($1, $2, $3) RETURNING id';
    const params = [title.trim(), description ? description.trim() : null, due_date || null];
    
    try {
        const result = await pool.query(sql, params);
        res.status(201).json({ id: result.rows[0].id, title, description, due_date, status: 'Pending' });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API ROUTE: PUT update a task
app.put('/tasks/:id', async (req, res) => {
    const { title, description, due_date, status } = req.body;
    const { id } = req.params;
    
    // Optional Input Validation bounds
    if (title && title.length > 255) return res.status(400).json({ error: 'Title too long' });
    if (description && description.length > 1000) return res.status(400).json({ error: 'Description too long' });
    if (status && !['Pending', 'Completed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const sql = 'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), due_date = COALESCE($3, due_date), status = COALESCE($4, status) WHERE id = $5';
    const params = [title, description, due_date, status, id];
    
    try {
        const result = await pool.query(sql, params);
        res.json({ message: `Task ${id} updated`, changes: result.rowCount });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API ROUTE: DELETE a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: `Task ${id} deleted successfully`, changes: result.rowCount });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
