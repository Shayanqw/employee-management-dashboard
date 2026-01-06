import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { healthCheck } from "../api/employees";

export default function Home() {
  const [health, setHealth] = useState({ status: "checking" });
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setError("");
        const data = await healthCheck(controller.signal);
        setHealth({ status: "ok", data });
      } catch (e) {
        // Health route is optional when running frontend-only
        setHealth({ status: "down" });
        setError(e?.message || "Could not reach backend.");
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Employee Management System</h1>
      <p className="subtitle">
        A full-stack CRUD dashboard (React + Express + MongoDB) with search, validation, and a clean UI.
      </p>

      <div className="panel">
        <h2 className="panelTitle">Backend Status</h2>
        <div className="statusRow">
          <span className={health.status === "ok" ? "badge badge-success" : health.status === "checking" ? "badge" : "badge badge-error"}>
            {health.status === "ok" ? "Online" : health.status === "checking" ? "Checking…" : "Offline"}
          </span>

          {health.status === "ok" && health.data?.timestamp && (
            <span className="muted">Last check: {new Date(health.data.timestamp).toLocaleString()}</span>
          )}
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      <div className="actions">
        <Link to="/employees" className="primaryBtn">Open Employees Dashboard</Link>
        <Link to="/login" className="secondaryBtn">Login (demo)</Link>
      </div>

      <div className="panel">
        <h2 className="panelTitle">What you can do</h2>
        <ul className="bullets">
          <li>View employees in a responsive table</li>
          <li>Search with debounce (reduced API spam)</li>
          <li>Create, edit, and delete employees</li>
          <li>Sort and paginate results</li>
          <li>Get toasts for success/error feedback</li>
        </ul>
      </div>
    </div>
  );
}
