// API_URL is now securely sourced from config.js

// DOM Elements
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const dateInput = document.getElementById('due_date');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', fetchTasks);

// Event Listeners
taskForm.addEventListener('submit', addTask);
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

// Fetch tasks from API
async function fetchTasks() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        tasks = await res.json();
        renderTasks();
    } catch (error) {
        taskList.innerHTML = `<div class="empty-state">Error loading tasks. Is the backend server running?</div>`;
        console.error(error);
    }
}

// Render tasks to DOM
function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter !== 'all') {
        filteredTasks = tasks.filter(t => t.status === currentFilter);
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<div class="empty-state">No tasks found here.</div>`;
        return;
    }

    filteredTasks.forEach(task => {
        const isCompleted = task.status === 'Completed';
        const li = document.createElement('li');
        li.className = `task-item ${isCompleted ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-content">
                <div class="task-title">${escapeHTML(task.title)}</div>
                ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
                <div class="task-meta">
                    ${task.due_date ? `<span>📅 ${task.due_date}</span>` : '<span>📅 No Date</span>'}
                    <span>Status: ${task.status}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-btn complete" onclick="toggleTask(${task.id}, '${task.status}')" title="${isCompleted ? 'Mark Pending' : 'Mark Completed'}">
                    ${isCompleted ? '↩️' : '✅'}
                </button>
                <button class="icon-btn delete" onclick="deleteTask(${task.id})" title="Delete Task">
                    🗑️
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Add a new task
async function addTask(e) {
    e.preventDefault();
    
    const newTask = {
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        due_date: dateInput.value
    };

    if (!newTask.title) return;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (res.ok) {
            const addedTask = await res.json();
            tasks.push(addedTask);
            taskForm.reset();
            renderTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// Toggle Task Status
async function toggleTask(id, currentStatus) {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks[index].status = newStatus;
                renderTasks();
            }
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Delete Task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Utility to escape HTML strings safely
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}
