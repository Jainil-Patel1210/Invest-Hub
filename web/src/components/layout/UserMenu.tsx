import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";

/** Avatar button in the top bar that opens a small account menu. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const initial = (user?.fullName ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
      >
        {initial}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-md border border-border bg-surface-raised py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            {user?.fullName && <div className="truncate text-sm font-medium">{user.fullName}</div>}
            <div className="truncate text-xs text-text-secondary">{user?.email}</div>
          </div>
          <Link
            to="/account"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text-primary"
          >
            Account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void logout()}
            className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg hover:text-text-primary"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
