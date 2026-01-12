const API_BASE = "https://checklist-art-f8d8.rkknitfabsachin.workers.dev";

function getToken() {
  const url = new URL(window.location.href);
  const t = url.searchParams.get("token");
  if (t) {
    localStorage.setItem("auth_token", t);
    window.history.replaceState({}, document.title, location.pathname);
    return t;
  }
  return localStorage.getItem("auth_token");
}

const token = getToken();
if (!token) alert("Access expired. Contact admin.");

let allTasks = [];

document.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: { Authorization: "Bearer " + token }
  });
  const json = await res.json();
  if (!json.success) return alert(json.error);

  document.getElementById("userEmail").textContent = json.data.email;
  allTasks = json.data.tasks;

  renderTasks();
  calculateStats();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  allTasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <div>
        <div class="task-title">${t.task}</div>
        <div class="task-meta">${t.date} • ${t.source}</div>
      </div>
      <button onclick="completeTask('${t.source}',${t.row},this)">Done</button>
    `;
    list.appendChild(div);
  });
}

async function completeTask(source, row, btn) {
  btn.disabled = true;

  await fetch(`${API_BASE}/tasks/complete`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ source, row })
  });

  loadTasks();
}

function calculateStats() {
  const today = new Date().toISOString().slice(0,10);

  const todayDone = allTasks.filter(t => t.date === today).length;
  const weekDone = allTasks.length;

  document.getElementById("todayDone").textContent = todayDone;
  document.getElementById("weekDone").textContent = weekDone;

  const rate = allTasks.length
    ? Math.min(100, Math.round((todayDone / allTasks.length) * 100))
    : 0;

  document.getElementById("completionBar").style.width = rate + "%";
  document.getElementById("completionText").textContent = rate + "%";
}
