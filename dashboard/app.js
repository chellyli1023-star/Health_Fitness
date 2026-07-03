const statePath = "../data/state.json";

const typeLabel = {
  Rest: "休息",
  Strength: "下肢力量",
  Uphill: "坡度走",
  Zone2: "Zone2 跑步",
  "Long Run": "长距离",
  Recovery: "恢复",
  "Zone2 Run": "Zone2"
};

const statusIcon = {
  completed: "✓",
  planned: "",
  empty: "",
  adjusted: "↻",
  warning: "!"
};

const statusLabel = {
  training: "今天：训练日",
  recovery: "今天：恢复日",
  rest: "今天：休息日"
};

const $ = (selector) => document.querySelector(selector);

function loadEmbeddedJson(id, fallback) {
  const element = document.getElementById(id);
  if (!element) return fallback;
  try {
    return JSON.parse(element.textContent);
  } catch (error) {
    console.warn(`Invalid embedded JSON: ${id}`, error);
    return fallback;
  }
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return await response.json();
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

function computeDaysRemaining(raceDate, todayDate) {
  const start = new Date(`${todayDate}T00:00:00`);
  const end = new Date(`${raceDate}T00:00:00`);
  return Math.max(0, Math.ceil((end - start) / 86400000));
}

function formatShortDate(value) {
  if (!value) return "--";
  const date = new Date(`${value}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function normalizeRecovery(value) {
  const labels = {
    Good: "Good",
    Caution: "Caution",
    Rest: "Rest",
    Medium: "Caution",
    Low: "Rest"
  };
  return labels[value] || value || "--";
}

function statusBox(status) {
  const className = status === "completed" ? "done" : status;
  return `<span class="status-box ${className}">${statusIcon[status] ?? ""}</span>`;
}

function getProgress(state) {
  return state.week.progress || {
    running_done_km: state.week.running_done_km,
    running_target_km: state.week.running_target_km,
    strength_done: state.week.strength_done,
    strength_target: state.week.strength_target,
    long_run_done: state.week.long_run_done,
    long_run_target: state.week.long_run_target
  };
}

function renderDashboard(state) {
  const raceDays = computeDaysRemaining(state.race.date, state.today.date);
  const progress = getProgress(state);

  $("#raceName").textContent = state.race.name;
  $("#daysRemaining").textContent = raceDays || state.race.days_remaining;
  $("#todayStatus").textContent = statusLabel[state.today.status] || "今天";
  $("#todayType").textContent = typeLabel[state.today.type] || state.today.type;
  $("#todayContent").textContent = state.today.content;
  $("#todayDuration").textContent = `${state.today.duration_min}min`;
  $("#recoveryPill").textContent = normalizeRecovery(state.today.recovery);
  $("#weekLabel").textContent = `${state.week.label} · 本周计划`;

  const reasonList = $("#todayReason");
  reasonList.innerHTML = "";
  (state.reasons || state.today.reason || []).slice(0, 3).forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    reasonList.appendChild(item);
  });

  const weekDays = $("#weekDays");
  weekDays.innerHTML = "";
  state.week.days.forEach((day) => {
    const row = document.createElement("article");
    row.className = "day-row";
    row.innerHTML = `
      ${statusBox(day.status)}
      <span class="day-name">${day.day}</span>
      <strong class="day-type">${typeLabel[day.type] || day.type}</strong>
      <span class="day-content">${day.content}</span>
    `;
    weekDays.appendChild(row);
  });

  $("#runningProgress").innerHTML = `${progress.running_done_km} <small>/ ${progress.running_target_km} km</small>`;
  $("#strengthProgress").innerHTML = `${progress.strength_done} <small>/ ${progress.strength_target}</small>`;
  $("#longRunProgress").innerHTML = `${progress.long_run_done} <small>/ ${progress.long_run_target}</small>`;

  const adjustment = state.last_ai_adjustment || {};
  $("#adjustmentDate").textContent = formatShortDate(adjustment.date);
  $("#adjustmentChange").textContent = adjustment.change || "--";
  $("#adjustmentReason").textContent = adjustment.reason ? `原因：${adjustment.reason}` : "--";
  $("#adjustmentConfidence").textContent = adjustment.confidence ? `Confidence：${adjustment.confidence}` : "--";
}

async function init() {
  try {
    const fallbackState = loadEmbeddedJson("fallback-state", null);
    const state = await loadJson(statePath, fallbackState);
    if (!state) throw new Error("state.json unavailable");
    renderDashboard(state);
  } catch (error) {
    document.body.innerHTML = `<p class="error">数据读取失败：${error.message}</p>`;
  }
}

init();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}
