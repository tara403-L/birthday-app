/**
 * In-memory store for Birthday Collision App.
 * Resets when server restarts.
 */
const store = {
  submissions: [],
  revealed: false,
};

function addSubmission({ name, month, day }) {
  const entry = { name: String(name).trim(), month: Number(month), day: Number(day) };
  store.submissions.push(entry);
  return entry;
}

function getCount() {
  return store.submissions.length;
}

function isRevealed() {
  return store.revealed;
}

function setRevealed(value) {
  store.revealed = !!value;
}

function getSubmissions() {
  return [...store.submissions];
}

function getSubmissionsForAdmin() {
  return store.submissions.map((s) => ({ name: s.name }));
}

function clearAll() {
  store.submissions = [];
  store.revealed = false;
}

/**
 * Group by month-day key. Returns array of { key, month, day, names } for keys with length > 1.
 * Sorted by month then day.
 */
function getMatches() {
  const byKey = {};
  for (const s of store.submissions) {
    const key = `${s.month}-${s.day}`;
    if (!byKey[key]) byKey[key] = { month: s.month, day: s.day, names: [] };
    byKey[key].names.push(s.name);
  }
  const matches = Object.values(byKey)
    .filter((g) => g.names.length > 1)
    .sort((a, b) => (a.month !== b.month ? a.month - b.month : a.day - b.day));
  return matches;
}

/**
 * P(at least one match) = 1 - (365 * 364 * ... * (365-N+1)) / 365^N
 */
function birthdayProbability(n) {
  if (n <= 1) return "0%";
  let p = 1;
  for (let i = 0; i < n; i++) {
    p *= (365 - i) / 365;
  }
  return ((1 - p) * 100).toFixed(1) + "%";
}

module.exports = {
  store,
  addSubmission,
  getCount,
  isRevealed,
  setRevealed,
  getSubmissions,
  getSubmissionsForAdmin,
  clearAll,
  getMatches,
  birthdayProbability,
};
