import { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import StudentPage from "./pages/StudentPage";
import WaitingPage from "./pages/WaitingPage";
import RevealPage from "./pages/RevealPage";
import AdminPage from "./pages/AdminPage";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within App");
  return ctx;
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCount, setRevealPayload } = useApp();

  useEffect(() => {
    if (location.pathname === "/admin") return;
    fetch("/api/count")
      .then((r) => r.json())
      .then((data) => {
        if (data.revealed) navigate("/reveal");
        else setCount(data.count ?? 0);
      })
      .catch(() => {});
  }, [navigate, location.pathname, setCount]);

  useEffect(() => {
    // Connect to same origin (no localhost) so Socket.io works in production (e.g. Railway)
    const socket = io(undefined, { path: "/socket.io", transports: ["polling", "websocket"] });

    socket.on("count_update", (data) => {
      setCount(data.count ?? 0);
    });

    socket.on("reveal", (data) => {
      setRevealPayload(data);
      navigate("/reveal");
    });

    socket.on("reset", () => {
      localStorage.removeItem("submitted");
      setRevealPayload(null);
      navigate("/");
    });

    return () => socket.disconnect();
  }, [navigate, setCount, setRevealPayload]);

  return (
    <Routes>
      <Route path="/" element={<StudentPage />} />
      <Route path="/waiting" element={<WaitingPage />} />
      <Route path="/reveal" element={<RevealPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default function App() {
  const [count, setCount] = useState(0);
  const [revealPayload, setRevealPayload] = useState(null);

  return (
    <AppContext.Provider value={{ count, setCount, revealPayload, setRevealPayload }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppContext.Provider>
  );
}
