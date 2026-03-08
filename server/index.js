require("dotenv").config();
const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const {
  addSubmission,
  getCount,
  isRevealed,
  setRevealed,
  getSubmissionsForAdmin,
  clearAll,
  getMatches,
  birthdayProbability,
} = require("./store");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: true },
});

app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "prof123";

function requireAdminPassword(req, res, next) {
  const password = req.body?.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Invalid admin password" });
  }
  next();
}

// POST /api/submit — accept { name, month, day }. No IP or server-side duplicate check;
// only the client uses localStorage, so incognito windows count as new students.
app.post("/api/submit", (req, res) => {
  const { name, month, day } = req.body || {};
  if (!name || month == null || day == null) {
    return res.status(400).json({ error: "Missing name, month, or day" });
  }
  const m = Number(month);
  const d = Number(day);
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return res.status(400).json({ error: "Invalid month or day" });
  }
  addSubmission({ name: String(name).trim(), month: m, day: d });
  const count = getCount();
  io.emit("count_update", { count });
  res.json({ success: true, count });
});

// GET /api/count — submission count + revealed status
app.get("/api/count", (req, res) => {
  res.json({
    count: getCount(),
    revealed: isRevealed(),
  });
});

// GET /api/results — full match data + probability (only when revealed)
app.get("/api/results", (req, res) => {
  if (!isRevealed()) {
    return res.status(404).json({ error: "Not revealed yet" });
  }
  const total = getCount();
  const matches = getMatches();
  const probability = birthdayProbability(total);
  res.json({
    matches,
    probability,
    total,
  });
});

// POST /api/reveal — trigger reveal (admin)
app.post("/api/reveal", requireAdminPassword, (req, res) => {
  if (isRevealed()) {
    return res.json({ success: true, alreadyRevealed: true });
  }
  setRevealed(true);
  const total = getCount();
  const matches = getMatches();
  const probability = birthdayProbability(total);
  io.emit("reveal", { matches, probability, total });
  res.json({ success: true, matches, probability, total });
});

// POST /api/reset — clear all (admin)
app.post("/api/reset", requireAdminPassword, (req, res) => {
  clearAll();
  io.emit("reset");
  res.json({ success: true });
});

// Admin: GET submission count + list of names (no birthdays)
app.get("/api/admin/submissions", (req, res) => {
  const password = req.query?.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Invalid admin password" });
  }
  res.json({
    count: getCount(),
    revealed: isRevealed(),
    submissions: getSubmissionsForAdmin(),
  });
});

// Serve built client in production
const distPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
