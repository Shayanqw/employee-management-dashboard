import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginDemoToken } from "../auth";

function isValidEmail(email) {
  // Simple, practical regex (not RFC-perfect on purpose)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/employees";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const emailOk = useMemo(() => isValidEmail(email), [email]);
  const passOk = useMemo(() => password.trim().length >= 6, [password]);

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!emailOk) return setError("Please enter a valid email.");
    if (!passOk) return setError("Password must be at least 6 characters.");

    // Demo login: store a token so routes can be protected.
    loginDemoToken("demo-token");
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="container">
      <h1 className="title">Login (Demo)</h1>
      <p className="subtitle">
        This is a lightweight demo login to showcase routing + protected pages (no real auth backend required).
      </p>

      <div className="panel">
        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Email
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              onBlur={() => setTouched(true)}
            />
            {touched && email && !emailOk && <span className="fieldError">Invalid email format.</span>}
          </label>

          <label className="label">
            Password
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              type="password"
              onBlur={() => setTouched(true)}
            />
            {touched && password && !passOk && <span className="fieldError">Too short.</span>}
          </label>

          {error && <div className="error">{error}</div>}

          <button className="primaryBtn" type="submit">
            Sign in
          </button>

          <div className="muted" style={{ marginTop: 12 }}>
            Tip: any valid email + 6+ char password works.
          </div>
        </form>
      </div>
    </div>
  );
}
