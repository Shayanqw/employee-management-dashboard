import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import RequireAuth from "./components/RequireAuth";
import Toast from "./components/Toast";
import { isAuthed, logout as doLogout } from "./auth";

import Home from "./pages/Home";
import Login from "./pages/Login";
import EmployeeManager from "./EmployeeManager";

export default function App() {
  const [toast, setToast] = useState(null);

  const authed = useMemo(() => isAuthed(), [toast]); // toast change triggers rerender; good enough for demo

  const pushToast = (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToast({ id, type, message });
  };

  const onLogout = () => {
    doLogout();
    pushToast("info", "Logged out.");
  };

  return (
    <div className="appShell">
      <NavBar isAuthed={authed} onLogout={onLogout} />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/employees"
            element={
              <RequireAuth>
                <EmployeeManager pushToast={pushToast} />
              </RequireAuth>
            }
          />

          <Route path="/logout" element={<Navigate to="/" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container">
      <h1 className="title">404</h1>
      <p className="subtitle">This page drifted into the void.</p>
    </div>
  );
}
