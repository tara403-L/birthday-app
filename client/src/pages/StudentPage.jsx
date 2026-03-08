import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function StudentPage() {
  const navigate = useNavigate();
  const { setCount } = useApp();
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("submitted") === "true") {
      navigate("/waiting");
      return;
    }
    fetch("/api/count")
      .then((r) => r.json())
      .then((data) => {
        if (data.revealed) navigate("/reveal");
        else setCount(data.count ?? 0);
      })
      .catch(() => {});
  }, [navigate, setCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!month || !day) {
      setError("Please select your birthday (month and day).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), month: Number(month), day: Number(day) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed.");
        return;
      }
      localStorage.setItem("submitted", "true");
      setCount(data.count ?? 0);
      navigate("/waiting");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-near-black flex flex-col">
      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-near-black mb-2">Birthday Collision</h1>
        <p className="text-near-black mb-6">Enter your name and birthday. Your lecturer will reveal who shares a birthday.</p>

        <form onSubmit={handleSubmit} className="bg-light-gray rounded-card p-6">
          <label className="block text-near-black font-semibold mb-2">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alice Smith"
            className="w-full bg-white border border-gray-300 px-4 py-3 text-near-black text-lg min-h-[48px] rounded-none focus:outline-none focus:ring-2 focus:ring-gold"
            required
          />

          <div className="mt-4">
            <span className="block text-near-black font-semibold mb-2">Birthday (month & day)</span>
            <div className="flex gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="flex-1 bg-white border border-gray-300 px-3 py-3 text-near-black text-base min-h-[48px] rounded-none focus:outline-none focus:ring-2 focus:ring-gold"
                required
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="flex-1 bg-white border border-gray-300 px-3 py-3 text-near-black text-base min-h-[48px] rounded-none focus:outline-none focus:ring-2 focus:ring-gold"
                required
              >
                <option value="">Day</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-near-black text-white font-semibold py-4 min-h-[48px] rounded-none hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        </form>
      </main>
      <footer className="bg-charcoal text-white py-4 px-4 text-center text-sm">
        Free University of Georgia — Probability Lecture
      </footer>
    </div>
  );
}
