import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStockSearch } from "../api/hooks/stocks";
import { useDebouncedValue } from "../lib/useDebouncedValue";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Ctrl/Cmd+K stock search: type, arrow through results, Enter to open. */
export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  if (!isOpen) return null;
  // Mounted only while open, so the query and highlighted row reset every time.
  return <PaletteBody onClose={onClose} />;
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebouncedValue(query, 200);
  const { data: results, isFetching } = useStockSearch(debounced);

  const trimmed = query.trim();
  const items = trimmed === "" ? [] : (results ?? []).slice(0, 8);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function open(symbol: string) {
    navigate(`/stocks/${encodeURIComponent(symbol)}`);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = items[activeIndex];
      if (item) open(item.symbol);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search stocks"
        className="glass w-full max-w-lg overflow-hidden rounded-xl"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search stocks by name or symbol..."
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        />
        <ul role="listbox" className="max-h-80 overflow-y-auto">
          {trimmed === "" && (
            <li className="px-4 py-3 text-sm text-text-secondary">Start typing to search.</li>
          )}
          {trimmed !== "" && items.length === 0 && (
            <li className="px-4 py-3 text-sm text-text-secondary">
              {isFetching ? "Searching..." : `No stocks found for "${trimmed}".`}
            </li>
          )}
          {items.map((r, i) => (
            <li key={r.symbol} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onClick={() => open(r.symbol)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                  i === activeIndex ? "bg-white/5 shadow-[inset_2px_0_0_var(--color-accent)]" : ""
                }`}
              >
                <span>
                  <span className="font-medium">{r.symbol}</span>
                  <span className="ml-2 text-text-secondary">{r.companyName}</span>
                </span>
                <span className="text-xs text-text-tertiary">{r.exchange}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
