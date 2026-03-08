import { useState, useEffect } from "react";
import { useApp } from "../App";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(month, day) {
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

export default function RevealPage() {
  const { revealPayload } = useApp();
  const [data, setData] = useState(revealPayload);

  useEffect(() => {
    if (revealPayload) {
      setData(revealPayload);
      return;
    }
    fetch("/api/results")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [revealPayload]);

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-near-black">Loading results…</p>
      </div>
    );
  }

  const { matches = [], probability = "0%", probabilityThisManyOrMore, total = 0, numMatches = 0 } = data;
  const hasMatches = matches.length > 0;

  return (
    <div className="min-h-screen bg-white text-near-black flex flex-col">
      <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold text-near-black mb-6">Birthday Results</h1>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-near-black mb-3 border-b-2 border-gold pb-2">Birthday matches</h2>
          {hasMatches ? (
            <ul className="space-y-4">
              {matches.map((m, i) => (
                <li key={i} className="bg-light-gray rounded-card p-4">
                  <p className="font-bold text-gold text-lg">{formatDate(m.month, m.day)}</p>
                  <ul className="mt-2 text-near-black">
                    {m.names.map((name, j) => (
                      <li key={j}>{name}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bg-light-gray rounded-card p-6 text-near-black text-lg">
              No matches! You defied the odds.
            </p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-near-black mb-3 border-b-2 border-gold pb-2">Probability stats</h2>
          <div className="space-y-4">
            <div className="bg-light-gray rounded-card p-6">
              <p className="text-sm font-semibold text-near-black mb-1">1. Standard Birthday Problem</p>
              <p className="text-near-black">
                Chance that <em>at least two</em> people in a group of <strong>{total}</strong> share any birthday:{" "}
                <span className="text-gold font-bold text-2xl">{probability}</span>
                {hasMatches ? " — and it happened!" : "."}
              </p>
            </div>
            <div className="bg-light-gray rounded-card p-6">
              <p className="text-sm font-semibold text-near-black mb-1">2. This many matches or more</p>
              <p className="text-near-black">
                Chance of getting <strong>{hasMatches ? numMatches : 0}</strong> or more separate birthday matches (pairs/groups) in a group of <strong>{total}</strong>:{" "}
                <span className="text-gold font-bold text-2xl">{probabilityThisManyOrMore ?? "—"}</span>
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-charcoal text-white py-4 px-4 text-center text-sm">
        ალბათობა და სტატისტიკა
      </footer>
    </div>
  );
}
