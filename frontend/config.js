// Configuration settings for API endpoints based on environment

// When deploying securely on Netlify, remember to replace the production URL string below:
// Example: 'https://student-task-manager-backend.onrender.com/tasks'

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/tasks'
    : 'https://student-task-manager-mqzp.onrender.com/'; // <--- PASTE RENDER PRODUCTION URL HERE BEFORE LAUNCHING
