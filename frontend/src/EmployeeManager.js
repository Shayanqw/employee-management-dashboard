import React, { useEffect, useMemo, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee,
} from "./api/employees";

const PAGE_SIZE = 8;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function normalizePayload(form) {
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim().toLowerCase(),
    gender: form.gender,
    salary: Number(form.salary),
  };
}

function validate(form) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required.";
  if (!form.last_name.trim()) errors.last_name = "Last name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(form.email)) errors.email = "Email looks invalid.";
  if (!form.gender) errors.gender = "Gender is required.";
  if (form.salary === "" || form.salary === null || form.salary === undefined)
    errors.salary = "Salary is required.";
  else if (Number.isNaN(Number(form.salary))) errors.salary = "Salary must be a number.";
  else if (Number(form.salary) <= 0) errors.salary = "Salary must be > 0.";
  return errors;
}

export default function EmployeeManager({ pushToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    salary: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [sort, setSort] = useState({ key: "last_name", dir: "asc" });
  const [page, setPage] = useState(1);

  const showToast = (type, msg) => pushToast?.(type, msg);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({ first_name: "", last_name: "", email: "", gender: "", salary: "" });
    setFormErrors({});
  };

  // Debounced fetch/search
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const q = search.trim();
        const data = q ? await searchEmployees(q, controller.signal) : await getEmployees(controller.signal);

        setEmployees(Array.isArray(data) ? data : []);
        setPage(1); // reset pagination when dataset changes
      } catch (e) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setError(e?.message || "Failed to load employees.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [search]);

  const onSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "asc" };
    });
  };

  const sorted = useMemo(() => {
    const copy = [...employees];
    const { key, dir } = sort;
    copy.sort((a, b) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      // numeric sort for salary
      if (key === "salary") return dir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);

      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return dir === "asc" ? -1 : 1;
      if (as > bs) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [employees, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, pageSafe]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onEdit = (emp) => {
    setIsEditing(true);
    setEditingId(emp._id);
    setForm({
      first_name: emp.first_name || "",
      last_name: emp.last_name || "",
      email: emp.email || "",
      gender: emp.gender || "",
      salary: emp.salary ?? "",
    });
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this employee? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
      showToast("success", "Employee deleted.");
    } catch (e) {
      showToast("error", e?.message || "Delete failed.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      showToast("error", "Please fix the highlighted fields.");
      return;
    }

    try {
      const payload = normalizePayload(form);

      if (isEditing && editingId) {
        const updated = await updateEmployee(editingId, payload);
        setEmployees((prev) => prev.map((x) => (x._id === editingId ? updated : x)));
        showToast("success", "Employee updated.");
      } else {
        const created = await createEmployee(payload);
        setEmployees((prev) => [created, ...prev]);
        showToast("success", "Employee created.");
      }

      resetForm();
    } catch (e2) {
      const msg = e2?.response?.data?.details || e2?.message || "Save failed.";
      showToast("error", msg);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Employees</h1>
      <p className="subtitle">CRUD dashboard with debounced search, validation, sorting, and pagination.</p>

      {/* Form */}
      <div className="panel">
        <div className="panelHeader">
          <h2 className="panelTitle">{isEditing ? "Edit Employee" : "Add Employee"}</h2>
          {isEditing && (
            <button className="secondaryBtn" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form className="form grid2" onSubmit={onSubmit}>
          <label className="label">
            First name
            <input className={formErrors.first_name ? "input input-error" : "input"} name="first_name" value={form.first_name} onChange={onChange} />
            {formErrors.first_name && <span className="fieldError">{formErrors.first_name}</span>}
          </label>

          <label className="label">
            Last name
            <input className={formErrors.last_name ? "input input-error" : "input"} name="last_name" value={form.last_name} onChange={onChange} />
            {formErrors.last_name && <span className="fieldError">{formErrors.last_name}</span>}
          </label>

          <label className="label">
            Email
            <input className={formErrors.email ? "input input-error" : "input"} name="email" value={form.email} onChange={onChange} />
            {formErrors.email && <span className="fieldError">{formErrors.email}</span>}
          </label>

          <label className="label">
            Gender
            <select className={formErrors.gender ? "input input-error" : "input"} name="gender" value={form.gender} onChange={onChange}>
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {formErrors.gender && <span className="fieldError">{formErrors.gender}</span>}
          </label>

          <label className="label">
            Salary
            <input
              className={formErrors.salary ? "input input-error" : "input"}
              name="salary"
              value={form.salary}
              onChange={onChange}
              inputMode="decimal"
              placeholder="e.g., 65000"
            />
            {formErrors.salary && <span className="fieldError">{formErrors.salary}</span>}
          </label>

          <div className="formActions">
            <button className="primaryBtn" type="submit">
              {isEditing ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>

      {/* Search + Table */}
      <div className="panel">
        <div className="panelHeader">
          <h2 className="panelTitle">Directory</h2>

          <div className="searchWrap">
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => onSort("first_name")} className="thClickable">
                  First {sort.key === "first_name" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => onSort("last_name")} className="thClickable">
                  Last {sort.key === "last_name" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => onSort("email")} className="thClickable">
                  Email {sort.key === "email" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => onSort("gender")} className="thClickable">
                  Gender {sort.key === "gender" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => onSort("salary")} className="thClickable" style={{ textAlign: "right" }}>
                  Salary {sort.key === "salary" ? (sort.dir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ width: 170 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="muted" style={{ padding: 18 }}>
                    Loading…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan="6" className="muted" style={{ padding: 18 }}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                paged.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.first_name}</td>
                    <td>{emp.last_name}</td>
                    <td className="mono">{emp.email}</td>
                    <td>{emp.gender}</td>
                    <td style={{ textAlign: "right" }}>${Number(emp.salary).toLocaleString()}</td>
                    <td>
                      <div className="rowActions">
                        <button type="button" className="secondaryBtn" onClick={() => onEdit(emp)}>
                          Edit
                        </button>
                        <button type="button" className="dangerBtn" onClick={() => onDelete(emp._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pager">
          <button className="secondaryBtn" type="button" disabled={pageSafe <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>

          <span className="muted">
            Page <b>{pageSafe}</b> of <b>{totalPages}</b> • {sorted.length} total
          </span>

          <button
            className="secondaryBtn"
            type="button"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
