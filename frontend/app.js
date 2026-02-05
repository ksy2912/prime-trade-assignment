const API_BASE = 'http://localhost:4000/api/v1';

const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authMessage = document.getElementById('auth-message');
const dashboardMessage = document.getElementById('dashboard-message');
const userInfo = document.getElementById('user-info');
const tasksList = document.getElementById('tasks-list');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const taskForm = document.getElementById('task-form');
const taskResetBtn = document.getElementById('task-reset');
const logoutButton = document.getElementById('logout-button');

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

function setToken(token) {
  if (token) {
    localStorage.setItem('jwt', token);
  } else {
    localStorage.removeItem('jwt');
  }
}

function getToken() {
  return localStorage.getItem('jwt');
}

function setAuthState(isAuthenticated) {
  if (isAuthenticated) {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
  } else {
    authSection.style.display = 'block';
    dashboardSection.style.display = 'none';
  }
}

function showMessage(el, msg, type = 'error') {
  el.textContent = msg || '';
  el.classList.remove('error', 'success');
  if (msg) {
    el.classList.add(type);
  }
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    const message = data.message || 'Request failed';
    const error = new Error(message);
    error.details = data;
    error.status = res.status;
    throw error;
  }

  return data;
}

function renderUserInfo(user) {
  if (!user) {
    userInfo.textContent = '';
    return;
  }

  userInfo.innerHTML = `
    Logged in as <strong>${user.name || user.email}</strong>
    <span style="opacity:0.8;">(${user.email})</span>
    • Role: <strong>${user.role}</strong>
  `;
}

function renderTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    tasksList.innerHTML = '<p class="message">No tasks yet. Create your first one!</p>';
    return;
  }

  tasksList.innerHTML = '';
  tasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="task-main">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span class="badge ${task.status}">${task.status}</span>
          <span>Updated: ${new Date(task.updatedAt).toLocaleString()}</span>
        </div>
        ${task.description ? `<div class="task-meta">${task.description}</div>` : ''}
      </div>
      <div class="task-actions">
        <button type="button" data-id="${task._id}" class="edit">Edit</button>
        <button type="button" data-id="${task._id}" class="delete">Delete</button>
      </div>
    `;
    tasksList.appendChild(item);
  });
}

async function loadCurrentUserAndTasks() {
  try {
    const [{ user }, { tasks }] = await Promise.all([
      apiRequest('/auth/me'),
      apiRequest('/tasks'),
    ]);
    renderUserInfo(user);
    renderTasks(tasks);
    showMessage(dashboardMessage, '');
  } catch (err) {
    console.error(err);
    setToken(null);
    setAuthState(false);
    showMessage(authMessage, 'Session expired, please log in again.', 'error');
  }
}

// Tabs
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
    tabContents.forEach((content) =>
      content.classList.toggle('active', content.id === `${target}-tab`)
    );
    showMessage(authMessage, '');
  });
});

// Auth forms
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMessage(authMessage, 'Logging in...', 'success');
  try {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const { user, token } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(token);
    setAuthState(true);
    showMessage(authMessage, '');
    await loadCurrentUserAndTasks();
  } catch (err) {
    console.error(err);
    showMessage(authMessage, err.message || 'Login failed', 'error');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMessage(authMessage, 'Registering...', 'success');
  try {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const { user, token } = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(token);
    setAuthState(true);
    showMessage(authMessage, '');
    await loadCurrentUserAndTasks();
  } catch (err) {
    console.error(err);
    showMessage(
      authMessage,
      err.message || 'Registration failed (maybe email already registered)',
      'error'
    );
  }
});

// Task form
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const status = document.getElementById('task-status').value;

  if (!title) {
    showMessage(dashboardMessage, 'Title is required', 'error');
    return;
  }

  showMessage(dashboardMessage, id ? 'Updating task...' : 'Creating task...', 'success');

  try {
    const body = { title, description, status };
    const method = id ? 'PUT' : 'POST';
    const path = id ? `/tasks/${id}` : '/tasks';

    await apiRequest(path, {
      method,
      body: JSON.stringify(body),
    });

    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-status').value = 'pending';
    showMessage(dashboardMessage, id ? 'Task updated' : 'Task created', 'success');
    await loadCurrentUserAndTasks();
  } catch (err) {
    console.error(err);
    showMessage(dashboardMessage, err.message || 'Task save failed', 'error');
  }
});

taskResetBtn.addEventListener('click', () => {
  taskForm.reset();
  document.getElementById('task-id').value = '';
  document.getElementById('task-status').value = 'pending';
  showMessage(dashboardMessage, '');
});

// Task list actions (edit/delete)
tasksList.addEventListener('click', async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains('edit')) {
    // Load single task for editing
    try {
      const { task } = await apiRequest(`/tasks/${id}`);
      document.getElementById('task-id').value = task._id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value = task.description || '';
      document.getElementById('task-status').value = task.status;
      showMessage(dashboardMessage, 'Editing task – make changes and click "Save Task".', 'success');
    } catch (err) {
      console.error(err);
      showMessage(dashboardMessage, err.message || 'Failed to load task', 'error');
    }
  }

  if (target.classList.contains('delete')) {
    if (!confirm('Delete this task?')) return;
    try {
      await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
      showMessage(dashboardMessage, 'Task deleted', 'success');
      await loadCurrentUserAndTasks();
    } catch (err) {
      console.error(err);
      showMessage(dashboardMessage, err.message || 'Delete failed', 'error');
    }
  }
});

// Logout
logoutButton.addEventListener('click', () => {
  setToken(null);
  setAuthState(false);
  renderUserInfo(null);
  tasksList.innerHTML = '';
  showMessage(authMessage, 'Logged out', 'success');
});

// Initial load: if token exists, try to load dashboard
(async function init() {
  const token = getToken();
  if (!token) {
    setAuthState(false);
    return;
  }
  setAuthState(true);
  await loadCurrentUserAndTasks();
})();


