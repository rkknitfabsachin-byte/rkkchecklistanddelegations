const API_BASE = "https://checklist-art-f8d8.rkknitfabsachin.workers.dev/";

function getToken() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");

  if (token) {
    localStorage.setItem("auth_token", token);
    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, url.toString());
    return token;
  }

  return localStorage.getItem("auth_token");
}

const token = getToken();

if (!token) {
  alert("Access link invalid or expired");
}

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();

  document.getElementById("datePicker").addEventListener("change", e => {
    loadUpcoming(e.target.value);
  });
});

function showStatus(msg) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}

async function loadTasks() {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: { Authorization: "Bearer " + token }
  });

  const json = await res.json();
  if (!json.success) return alert(json.error);

  document.getElementById("userEmail").textContent = json.data.email;

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  json.data.tasks.forEach(t => {
    list.appendChild(renderTask(t));
  });
}

async function loadUpcoming(date) {
  if (!date) return;

  const res = await fetch(`${API_BASE}/tasks?view=upcoming&date=${date}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const json = await res.json();
  if (!json.success) return;

  const list = document.getElementById("upcomingList");
  list.innerHTML = "";

  json.data.tasks.forEach(t => {
    if (t.source === "checklist") {
      list.appendChild(renderTask(t));
    }
  });
}

function renderTask(task) {
  const div = document.createElement("div");
  div.className = "task";

  const info = document.createElement("div");
  info.className = "task-info";

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.task;

  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.textContent = `${task.date} • ${task.source}`;

  info.appendChild(title);
  info.appendChild(meta);

  const btn = document.createElement("button");
  btn.textContent = "Done";
  btn.onclick = () => completeTask(task, btn);

  div.appendChild(info);
  div.appendChild(btn);

  return div;
}

async function completeTask(task, btn) {
  btn.disabled = true;

  const res = await fetch(`${API_BASE}/tasks/complete`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      source: task.source,
      row: task.row
    })
  });

  const json = await res.json();

  if (json.success) {
    showStatus("Task marked completed");
    loadTasks();
  } else {
    alert(json.error);
    btn.disabled = false;
  }
}
