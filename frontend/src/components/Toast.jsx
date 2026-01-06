import React, { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  // toast: { id, type: "success"|"error"|"info", message }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose?.(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const className =
    toast.type === "success"
      ? "toast toast-success"
      : toast.type === "error"
      ? "toast toast-error"
      : "toast toast-info";

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <div className={className}>
        <span className="toast-dot" aria-hidden="true" />
        <span>{toast.message}</span>
        <button className="toast-close" onClick={() => onClose?.(toast.id)} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}
