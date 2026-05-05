import React, { useState, useEffect, useRef } from "react";

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  getLabel,
  getValue,
  className = "",
  onCreateNew,
  createNewLabel = "Create new"
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const resolveValue = getValue || ((o) => o.value);
  const resolveLabel = getLabel || ((o) => o.label);

  const selectedOption = options.find(
    (o) => String(resolveValue(o)) === String(value)
  );
  const selectedLabel = selectedOption ? resolveLabel(selectedOption) : "";

  const filtered = query.trim()
    ? options.filter((o) =>
        String(resolveLabel(o))
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightedIndex];
      if (item && item.scrollIntoView) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option) => {
    onChange(resolveValue(option));
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filtered[highlightedIndex]) handleSelect(filtered[highlightedIndex]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const baseClasses =
    "w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedLabel || placeholder}
          className={baseClasses + " pr-8"}
        />
        {value !== "" && value != null && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange("");
              setQuery("");
            }}
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg leading-none"
            title="Clear selection"
          >
            ×
          </button>
        )}
      </div>
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-2xl max-h-72 overflow-y-auto"
        >
          {filtered.length === 0 && !onCreateNew && (
            <div className="px-3 py-2 text-gray-400">No matches</div>
          )}
          {filtered.map((option, i) => {
            const isSelected =
              String(resolveValue(option)) === String(value);
            return (
              <div
                key={String(resolveValue(option))}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                  i === highlightedIndex
                    ? "bg-blue-600 text-white"
                    : "text-gray-200 hover:bg-gray-700"
                }`}
              >
                <span>{resolveLabel(option)}</span>
                {isSelected && <span className="text-xs">✓</span>}
              </div>
            );
          })}
          {onCreateNew && query.trim() && !filtered.some(
            (o) => String(resolveLabel(o)).toLowerCase() === query.trim().toLowerCase()
          ) && (
            <div
              onMouseDown={async (e) => {
                e.preventDefault();
                try {
                  const created = await onCreateNew(query.trim());
                  if (created) {
                    onChange(resolveValue(created));
                  }
                } catch (err) {
                  alert('Failed to create: ' + (err.message || 'Unknown error'));
                }
                setQuery("");
                setIsOpen(false);
              }}
              className="px-3 py-2 cursor-pointer border-t border-gray-700 bg-emerald-700/40 hover:bg-emerald-600/60 text-white"
            >
              + {createNewLabel} "{query.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
