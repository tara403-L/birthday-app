import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App";

export default function AdminPage() {
  const navigate = useNavigate();
  const { count: liveCount } = useApp();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const loadDashboard = () => {
    if (!password) return;
    setLoading(true);
    setError("");
    fetch(`/api/admin/submissions?password=${encodeURIComponent(password)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid password");
        return r.json();
      })
      .then((data) => {
        setSubmissions(data.submissions ?? []);
        setAuthenticated(true);
      })
      .catch(() => {
        setError("Invalid password.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authenticated || !password) return;
    fetch(`/api/admin/submissions?password=${encodeURIComponent(password)}`)
      .then((r) => r.json())
      .then((data) => setSubmissions(data.submissions ?? []))
      .catch(() => {});
  }, [authenticated, password, liveCount]);

  const handleReveal = () => {
    setActionLoading("reveal");
    fetch("/api/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else navigate("/reveal");
      })
      .catch(() => setError("Request failed"))
      .finally(() => setActionLoading(""));
  };

  const handleReset = () => {
    if (!confirm("Clear all submissions and send everyone back to the form?")) return;
    setActionLoading("reset");
    fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setSubmissions([]);
        }
      })
      .catch(() => setError("Request failed"))
      .finally(() => setActionLoading(""));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-charcoal text-white flex flex-col">
        <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-4">Admin</h1>
          <p className="text-white/80 mb-4">Enter the admin password to continue.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-light-gray text-near-black px-4 py-3 min-h-[48px] rounded-none focus:outline-none focus:ring-2 focus:ring-gold"
            onKeyDown={(e) => e.key === "Enter" && loadDashboard()}
          />
          {error && <p className="mt-2 text-gold text-sm">{error}</p>}
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="mt-4 w-full bg-near-black text-white font-semibold py-4 min-h-[48px] rounded-none hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col">
      <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Admin dashboard</h1>

        <div className="bg-light-gray rounded-card p-6 text-near-black mb-6">
          <p className="text-lg">
            <span className="font-bold text-gold text-2xl">{liveCount}</span>
            <span className="ml-2">students have submitted</span>
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold border-b-2 border-gold pb-2 mb-3">Submitted names</h2>
          {submissions.length === 0 ? (
            <p className="text-white/80">No submissions yet.</p>
          ) : (
            <ul className="bg-light-gray rounded-card p-4 text-near-black max-h-48 overflow-y-auto">
              {submissions.map((s, i) => (
                <li key={i}>{s.name}</li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-gold text-sm mb-4">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleReveal}
            disabled={actionLoading !== "" || liveCount === 0}
            className="w-full bg-near-black text-white font-semibold py-4 min-h-[48px] rounded-none hover:opacity-90 disabled:opacity-60"
          >
            {actionLoading === "reveal" ? "Revealing…" : "Reveal results"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={actionLoading !== ""}
            className="w-full bg-white text-near-black font-semibold py-4 min-h-[48px] rounded-none hover:bg-light-gray disabled:opacity-60"
          >
            {actionLoading === "reset" ? "Resetting…" : "Reset session"}
          </button>
        </div>
      </main>
      <footer className="py-4 px-4 text-center text-white/80 text-sm">
        Free University of Georgia — Admin
      </footer>
    </div>
  );
}
