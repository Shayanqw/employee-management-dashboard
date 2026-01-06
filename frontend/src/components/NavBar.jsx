import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar({ onLogout, isAuthed }) {
  const { pathname } = useLocation();

  const Item = ({ to, children }) => (
    <Link className={pathname === to ? "nav-link nav-link-active" : "nav-link"} to={to}>
      {children}
    </Link>
  );

  return (
    <div className="nav">
      <div className="nav-left">
        <span className="nav-brand">Employee Manager</span>
        <Item to="/">Home</Item>
        <Item to="/employees">Employees</Item>
      </div>

      <div className="nav-right">
        {isAuthed ? (
          <button className="nav-btn" onClick={onLogout}>Logout</button>
        ) : (
          <Item to="/login">Login</Item>
        )}
      </div>
    </div>
  );
}
