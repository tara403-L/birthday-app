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

/**
 * P(at least K distinct shared birthdays) via Monte Carlo simulation.
 * "K matches" = K distinct birth-dates that appear at least twice among N people.
 */
function probabilityAtLeastKMatches(n, k, trials = 50000) {
  if (n <= 1 || k <= 0) return "100%";
  if (k > n) return "0%";
  let count = 0;
  for (let t = 0; t < trials; t++) {
    const freq = {};
    for (let i = 0; i < n; i++) {
      const b = Math.floor(Math.random() * 365) + 1;
      freq[b] = (freq[b] || 0) + 1;
    }
    const matchCount = Object.values(freq).filter((c) => c >= 2).length;
    if (matchCount >= k) count++;
  }
  return ((count / trials) * 100).toFixed(1) + "%";
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
  probabilityAtLeastKMatches,
};
