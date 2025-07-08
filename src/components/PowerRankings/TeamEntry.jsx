import React, { useState } from "react";

export default function TeamEntry({ team, body }) {
  const [expanded, setExpanded] = useState(false);
  const firstLine = body.trim().split("\n")[0];

  return (
    <div
      className="mb-6 bg-[#2a2a3d] rounded-lg shadow-lg overflow-hidden cursor-pointer transition hover:shadow-xl"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <h3 className="text-xl font-semibold text-orange-300 mb-2">{team}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {expanded ? body : firstLine}
        </p>
        <p className="mt-2 text-xs text-blue-300 italic">
          {expanded ? "Click to collapse ▲" : "Click to expand ▼"}
        </p>
      </div>
    </div>
  );
}
