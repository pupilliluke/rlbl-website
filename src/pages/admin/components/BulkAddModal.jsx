import React, { useState } from "react";

const BulkAddModal = ({
  show,
  title,
  description,
  placeholder,
  onCancel,
  onSubmit,
  extraControls,
  parseLine
}) => {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  if (!show) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = lines.map((line) => {
    try {
      return { ok: true, data: parseLine(line), raw: line };
    } catch (e) {
      return { ok: false, error: e.message || "Invalid line", raw: line };
    }
  });

  const validParsed = parsed.filter((p) => p.ok);

  const handleSubmit = async () => {
    if (validParsed.length === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await onSubmit(validParsed.map((p) => p.data));
      setResult(r);
      if (r && r.failures?.length === 0) {
        setText("");
      }
    } catch (e) {
      setResult({
        successes: [],
        failures: [{ raw: "(submission)", error: e.message || "Submit failed" }]
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {extraControls}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={10}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono text-sm"
          />

          <div className="text-sm text-gray-400">
            {lines.length === 0
              ? "Empty"
              : `${validParsed.length} valid${
                  parsed.length - validParsed.length > 0
                    ? `, ${parsed.length - validParsed.length} invalid`
                    : ""
                }`}
          </div>

          {parsed.some((p) => !p.ok) && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-sm">
              <div className="font-semibold text-yellow-300 mb-1">
                Lines that won't be processed:
              </div>
              <ul className="list-disc list-inside text-yellow-200 space-y-1">
                {parsed
                  .filter((p) => !p.ok)
                  .slice(0, 5)
                  .map((p, i) => (
                    <li key={i}>
                      <span className="font-mono">{p.raw}</span> — {p.error}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              {result.successes?.length > 0 && (
                <div className="bg-green-900/30 border border-green-700 rounded p-3 text-sm text-green-200">
                  ✓ Created {result.successes.length}
                </div>
              )}
              {result.failures?.length > 0 && (
                <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm">
                  <div className="font-semibold text-red-300 mb-1">
                    Failed ({result.failures.length}):
                  </div>
                  <ul className="list-disc list-inside text-red-200 space-y-1 max-h-32 overflow-y-auto">
                    {result.failures.map((f, i) => (
                      <li key={i}>
                        <span className="font-mono">{f.raw}</span> — {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-600 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          >
            {result ? "Close" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || validParsed.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {busy && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {busy ? "Working..." : `Create ${validParsed.length}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAddModal;
