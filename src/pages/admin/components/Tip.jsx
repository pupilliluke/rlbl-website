import React from "react";

/**
 * Small contextual hint shown only when admin tips are enabled.
 *
 * Props:
 *  - enabled: boolean — render only when true
 *  - children: tip body
 *  - icon: optional emoji (defaults to 💡)
 *  - tone: 'info' (default), 'warn', 'success'
 *  - className: extra classes for the wrapper
 */
const Tip = ({ enabled, children, icon = "💡", tone = "info", className = "" }) => {
  if (!enabled) return null;
  const tones = {
    info: "bg-blue-900/20 border-blue-500/40 text-blue-100",
    warn: "bg-yellow-900/20 border-yellow-500/40 text-yellow-100",
    success: "bg-emerald-900/20 border-emerald-500/40 text-emerald-100"
  };
  const cls = tones[tone] || tones.info;
  return (
    <div className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${cls} ${className}`}>
      <span className="text-lg leading-none">{icon}</span>
      <div className="flex-1 leading-snug">{children}</div>
    </div>
  );
};

export default Tip;
