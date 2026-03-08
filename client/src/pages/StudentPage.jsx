import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App";

const MONTHS = [
  { value: 1, label: "იანვარი" }, { value: 2, label: "თებერვალი" }, { value: 3, label: "მარტი" },
  { value: 4, label: "აპრილი" }, { value: 5, label: "მაისი" }, { value: 6, label: "ივნისი" },
  { value: 7, label: "ივლისი" }, { value: 8, label: "აგვისტო" }, { value: 9, label: "სექტემბერი" },
  { value: 10, label: "ოქტომბერი" }, { value: 11, label: "ნოემბერი" }, { value: 12, label: "დეკემბერი" },
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

  // Duplicate check is localStorage-only: no IP or server-side dedupe.
  // Incognito / other devices have no 'submitted' flag, so they count as new students.
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
      setError("შეიყვანეთ სახელი.");
      return;
    }
    if (!month || !day) {
      setError("აირჩიეთ დაბადების დღე.");
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
        setError(data.error || "გაგზავნა ვერ მოხდა.");
        return;
      }
      localStorage.setItem("submitted", "true");
      setCount(data.count ?? 0);
      navigate("/waiting");
    } catch {
      setError("შეცდომა. სცადეთ თავიდან.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-near-black flex flex-col">
      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-near-black mb-2">დაბადების დღის აპი</h1>

        <form onSubmit={handleSubmit} className="bg-light-gray rounded-card p-6">
          <label className="block text-near-black font-semibold mb-2">შეიყვანეთ სახელი და გვარი</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="მაგ. გიორგი გიორგაძე"
            className="w-full bg-white border border-gray-300 px-4 py-3 text-near-black text-lg min-h-[48px] rounded-none focus:outline-none focus:ring-2 focus:ring-gold"
            required
          />

          <div className="mt-4">
            <span className="block text-near-black font-semibold mb-2">დაბადების დღე</span>
            <div className="flex gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="flex-1 bg-white border border-gray-300 px-3 py-3 text-near-black text-base min-h-[48px] rounded-none focus:outline-none focus:ring-2 focus:ring-gold"
                required
              >
                <option value="">აირჩიეთ თვე</option>
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
                <option value="">აირჩიეთ დღე</option>
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
            {loading ? "იგზავნება…" : "გაგზავნა"}
          </button>
        </form>
      </main>
      <footer className="bg-charcoal text-white py-4 px-4 text-center text-sm">
        ალბათობა და სტატისტიკა
      </footer>
    </div>
  );
}
