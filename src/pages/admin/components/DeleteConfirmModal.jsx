import React, { useState, useEffect } from "react";

/**
 * Delete confirmation modal with optional scope toggle.
 *
 * Props:
 * - show: boolean
 * - title: string (e.g. "Delete Player 'Joe Schmo'?")
 * - entityName: string (typed to confirm destructive deletes)
 * - scopeOptions: optional array of { key, label, description, consequences[], destructive, action }
 *     If omitted, modal renders a single-action confirm.
 * - consequences: array of strings (used when scopeOptions is not provided)
 * - destructive: boolean (used when scopeOptions is not provided)
 * - onCancel: () => void
 * - onConfirm: () => Promise<void> (used when scopeOptions is not provided)
 * - confirmLabel: string
 */
const DeleteConfirmModal = ({
  show,
  title,
  entityName,
  scopeOptions,
  consequences = [],
  destructive = false,
  onCancel,
  onConfirm,
  confirmLabel = "Delete"
}) => {
  const [selectedKey, setSelectedKey] = useState(scopeOptions?.[0]?.key || null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (show) {
      setSelectedKey(scopeOptions?.[0]?.key || null);
      setTyped("");
      setBusy(false);
      setErrorMessage("");
    }
  }, [show, scopeOptions]);

  if (!show) return null;

  const selectedOption = scopeOptions?.find(o => o.key === selectedKey) || null;
  const isDestructive = scopeOptions ? !!selectedOption?.destructive : destructive;
  const requiresType = isDestructive && !!entityName;
  const typeMatches = !requiresType || typed.trim() === entityName;

  const consequenceList = scopeOptions
    ? selectedOption?.consequences || []
    : consequences;

  const handleSubmit = async () => {
    if (!typeMatches || busy) return;
    setErrorMessage("");
    setBusy(true);
    try {
      if (scopeOptions && selectedOption) {
        await selectedOption.action();
      } else if (onConfirm) {
        await onConfirm();
      }
    } catch (e) {
      setErrorMessage(e.message || 'Unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      tabIndex={-1}
    >
      <div className={`bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-2 ${isDestructive ? 'border-red-500' : 'border-yellow-500'}`}>
        <div className={`px-6 py-4 border-b border-gray-600 ${isDestructive ? 'bg-red-900/30' : 'bg-yellow-900/20'}`}>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{isDestructive ? '⚠️' : '🗑️'}</span>
            {title}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border-2 border-red-500 bg-red-900/30 p-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-2xl leading-none">🚫</span>
                <div className="flex-1">
                  <div className="font-bold text-red-300 mb-1 text-base">Delete blocked</div>
                  <div className="text-red-100 whitespace-pre-wrap">{errorMessage}</div>
                  <div className="mt-2 text-xs text-red-200/80">
                    Adjust the scope above, delete the blocking rows first, or click Cancel.
                  </div>
                </div>
              </div>
            </div>
          )}
          {scopeOptions && scopeOptions.length > 1 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300 font-semibold">Choose what to delete:</div>
              {scopeOptions.map(opt => (
                <label
                  key={opt.key}
                  className={`block cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedKey === opt.key
                      ? (opt.destructive ? 'border-red-500 bg-red-900/20' : 'border-blue-500 bg-blue-900/20')
                      : 'border-gray-600 bg-gray-700/40 hover:bg-gray-700/60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      checked={selectedKey === opt.key}
                      onChange={() => { setSelectedKey(opt.key); setErrorMessage(""); }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {opt.label}
                        {opt.destructive && (
                          <span className="ml-2 text-xs text-red-400 uppercase">Destructive</span>
                        )}
                      </div>
                      {opt.description && (
                        <div className="text-sm text-gray-400 mt-1">{opt.description}</div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {consequenceList.length > 0 && (
            <div className={`rounded-lg p-3 text-sm ${isDestructive ? 'bg-red-900/20 border border-red-700' : 'bg-yellow-900/10 border border-yellow-700'}`}>
              <div className={`font-semibold mb-2 ${isDestructive ? 'text-red-300' : 'text-yellow-300'}`}>
                This will also remove:
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {consequenceList.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {requiresType && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Type <span className="font-mono bg-gray-700 px-2 py-0.5 rounded text-yellow-300">{entityName}</span> to confirm:
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:border-red-500 focus:outline-none font-mono"
                placeholder={entityName}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-600 bg-gray-900/50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!typeMatches || busy}
            className={`px-4 py-2 text-white rounded font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {busy && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            {busy ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
