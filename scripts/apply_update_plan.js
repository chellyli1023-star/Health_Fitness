const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const paths = {
  updatePlan: path.join(root, "data", "update_plan.json"),
  state: path.join(root, "data", "state.json"),
  weeklyPlan: path.join(root, "data", "weekly_plan.json"),
  trainingLog: path.join(root, "data", "training_log.json"),
  bodyLog: path.join(root, "data", "body_log.json"),
  coachJournal: path.join(root, "data", "coach_journal.json"),
  settings: path.join(root, "data", "settings.json"),
  indexHtml: path.join(root, "dashboard", "index.html")
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tempPath, filePath);
}

function writeTextAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, value);
  fs.renameSync(tempPath, filePath);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function localIsoTimestamp(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const minutes = String(absMinutes % 60).padStart(2, "0");
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19);
  return `${local}${sign}${hours}:${minutes}`;
}

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
}

function validateUpdatePlan(plan) {
  if (!isObject(plan)) throw new Error("update_plan.json must contain an object");
  if (!isObject(plan.meta)) throw new Error("meta is required");
  if (!isObject(plan.today)) throw new Error("today is required");
  if (!isObject(plan.weekly_plan)) throw new Error("weekly_plan is required");
  assertArray(plan.weekly_plan.days, "weekly_plan.days");
  if (plan.weekly_plan.days.length !== 7) {
    throw new Error("weekly_plan.days must contain exactly 7 days");
  }

  const append = plan.append || {};
  ["training_log", "body_log", "coach_journal"].forEach((key) => {
    if (append[key] !== undefined) assertArray(append[key], `append.${key}`);
  });
}

function appendOnly(existing, additions, label) {
  assertArray(existing, label);
  if (additions === undefined) return existing;
  assertArray(additions, `append.${label}`);
  return existing.concat(additions);
}

function parseKm(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const match = value.match(/(\d+(?:\.\d+)?)\s*km/i);
  return match ? Number(match[1]) : 0;
}

function isRunningType(type) {
  return ["Zone2", "Zone2 Run", "Long Run"].includes(type);
}

function computeWeekStats(weeklyPlan) {
  const completedDays = weeklyPlan.days.filter((day) => day.completed || day.status === "completed");
  const runningDone = completedDays
    .filter((day) => isRunningType(day.type))
    .reduce((sum, day) => sum + parseKm(day.distance_km ?? day.content), 0);
  const strengthDone = completedDays.filter((day) => day.type === "Strength").length;
  const longRunDone = completedDays.filter((day) => day.type === "Long Run").length;

  return {
    running_done_km: Number(runningDone.toFixed(2)),
    running_target_km: weeklyPlan.running_target_km,
    strength_done: strengthDone,
    strength_target: weeklyPlan.strength_target,
    long_run_done: longRunDone,
    long_run_target: weeklyPlan.long_run_target || 1
  };
}

function normalizeStateDay(day) {
  return {
    day: day.day,
    status: day.status,
    type: day.type,
    content: day.content
  };
}

function latest(array) {
  return array.length ? array[array.length - 1] : null;
}

function buildState({ currentState, settings, weeklyPlan, coachJournal, updatePlan, timestamp }) {
  const weekStats = computeWeekStats(weeklyPlan);
  const race = updatePlan.race || currentState.race || {
    name: "太舞崇礼25K",
    date: settings.race_date,
    distance_km: settings.race_distance_km
  };
  const reasons = updatePlan.reasons || updatePlan.today.reason || currentState.reasons || [];

  return {
    race,
    today: updatePlan.today,
    reasons: reasons.slice(0, 3),
    week: {
      label: weeklyPlan.week_label,
      progress: weekStats,
      days: weeklyPlan.days.map(normalizeStateDay)
    },
    next_training: updatePlan.next_training || currentState.next_training || null,
    last_ai_adjustment: latest(coachJournal) || currentState.last_ai_adjustment || null,
    last_updated: timestamp
  };
}

function replaceEmbeddedState(indexHtml, state) {
  const serialized = JSON.stringify(state, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  const pattern = /<script id="fallback-state" type="application\/json">[\s\S]*?<\/script>/;
  const replacement = `<script id="fallback-state" type="application/json">\n${serialized}\n    </script>`;
  if (!pattern.test(indexHtml)) {
    throw new Error("fallback-state script not found in dashboard/index.html");
  }
  return indexHtml.replace(pattern, replacement);
}

function main() {
  try {
    const updatePlan = readJson(paths.updatePlan);
    validateUpdatePlan(updatePlan);

    const currentState = readJson(paths.state);
    const settings = readJson(paths.settings);
    const trainingLog = readJson(paths.trainingLog);
    const bodyLog = readJson(paths.bodyLog);
    const coachJournal = readJson(paths.coachJournal);
    const indexHtml = fs.readFileSync(paths.indexHtml, "utf8");

    const append = updatePlan.append || {};
    const nextTrainingLog = appendOnly(trainingLog, append.training_log, "training_log");
    const nextBodyLog = appendOnly(bodyLog, append.body_log, "body_log");
    const nextCoachJournal = appendOnly(coachJournal, append.coach_journal, "coach_journal");
    const timestamp = updatePlan.last_updated || localIsoTimestamp();
    const nextWeeklyPlan = updatePlan.weekly_plan;
    const nextState = buildState({
      currentState,
      settings,
      weeklyPlan: nextWeeklyPlan,
      coachJournal: nextCoachJournal,
      updatePlan,
      timestamp
    });
    const nextIndexHtml = replaceEmbeddedState(indexHtml, nextState);

    writeJsonAtomic(paths.trainingLog, nextTrainingLog);
    writeJsonAtomic(paths.bodyLog, nextBodyLog);
    writeJsonAtomic(paths.weeklyPlan, nextWeeklyPlan);
    writeJsonAtomic(paths.coachJournal, nextCoachJournal);
    writeJsonAtomic(paths.state, nextState);
    writeTextAtomic(paths.indexHtml, nextIndexHtml);

    console.log("AI Coach update applied.");
    console.log(`state regenerated: ${nextState.last_updated}`);
  } catch (error) {
    console.error("AI Coach update failed. Existing data was not intentionally changed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
