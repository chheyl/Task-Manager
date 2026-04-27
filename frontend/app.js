const API = 'http://localhost:5000/api';
let token = localStorage.getItem('token');

// Show correct screen on load
if (token) showApp();

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  loadTasks();
}

function showAuth() {
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

// ── Auth ─────────────────────────────────────────────
async function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  document.getElementById('auth-msg').textContent = data.message || data.error;
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem('token', token);
    showApp();
  } else {
    document.getElementById('auth-msg').textContent = data.error;
  }
}

function logout() {
  localStorage.removeItem('token');
  token = null;
  showAuth();
}

// ── Tasks ─────────────────────────────────────────────
async function loadTasks() {
  const res = await fetch(`${API}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tasks = await res.json();
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(renderTask);
}

function renderTask(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.innerHTML = `
    <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask('${task._id}', this.checked)" />
    <span class="task-title ${task.done ? 'done' : ''}">${task.title}</span>
    <button class="delete-btn" onclick="deleteTask('${task._id}')">×</button>
  `;
  document.getElementById('task-list').appendChild(li);
}

async function addTask() {
  const input = document.getElementById('task-input');
  const title = input.value.trim();
  if (!title) return;
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title })
  });
  const task = await res.json();
  renderTask(task);
  input.value = '';
}

async function toggleTask(id, done) {
  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ done })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadTasks();
}