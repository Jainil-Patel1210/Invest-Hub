import { Plus } from "lucide-react";
import { useState } from "react";
import { ApiError } from "../../api/client";
import { useCreateWatchlist, useWatchlists } from "../../api/hooks/watchlists";
import { SkeletonList } from "../../components/Skeleton";
import { WatchlistPanel } from "./components/WatchlistPanel";

export function WatchlistPage() {
  const { data: watchlists, isLoading } = useWatchlists();
  const createWatchlist = useCreateWatchlist();

  // Only tracks what the user has explicitly clicked -- not "the current
  // selection" on its own. Syncing that via a separate useEffect (comparing
  // it against the loaded list and calling setState to correct it) is
  // exactly the "adjusting state based on other state" anti-pattern React's
  // own docs warn against: it queues an extra render after the one that
  // already had the data needed to compute the right answer. Deriving
  // `selectedId` below, during render, does the same job in one pass with
  // no effect at all.
  const [explicitSelectedId, setExplicitSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Falls back to the first watchlist whenever nothing's been explicitly
  // picked yet, or the pick no longer exists (e.g. it was just deleted) --
  // recomputed fresh on every render from whatever `watchlists` currently is.
  const selectedId =
    explicitSelectedId !== null && watchlists?.some((w) => w.id === explicitSelectedId)
      ? explicitSelectedId
      : (watchlists?.[0]?.id ?? null);

  async function handleCreate() {
    setCreateError(null);
    if (newName.trim() === "") return;
    try {
      const created = await createWatchlist.mutateAsync(newName.trim());
      setExplicitSelectedId(created.id);
      setNewName("");
      setIsCreating(false);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  if (isLoading) return <SkeletonList rows={4} />;

  const selected = watchlists?.find((w) => w.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Tracked instruments
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-sidebar p-1" role="tablist">
        {watchlists?.map((w) => (
          <button
            key={w.id}
            type="button"
            role="tab"
            aria-selected={w.id === selectedId}
            onClick={() => setExplicitSelectedId(w.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              w.id === selectedId
                ? "bg-surface-raised text-text-primary shadow-[inset_2px_0_0_var(--color-accent-strong)]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {w.name} <span className="text-xs text-text-tertiary">({w.itemCount})</span>
          </button>
        ))}

        {isCreating ? (
          <div className="flex items-center gap-1.5 pl-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
              placeholder="Watchlist name"
              className="rounded-md bg-surface px-2 py-1 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
            />
            <button
              type="button"
              onClick={() => void handleCreate()}
              className="text-xs font-medium text-accent hover:underline"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewName("");
                setCreateError(null);
              }}
              className="text-xs text-text-secondary hover:underline"
            >
              Cancel
            </button>
            {createError && <span className="text-xs text-loss">{createError}</span>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-text-secondary hover:text-accent"
          >
            <Plus size={14} aria-hidden="true" />
            New
          </button>
        )}
      </div>

      {selected ? (
        // `key` forces React to treat each watchlist as a genuinely
        // different component instance rather than reusing one across
        // selections -- without it, switching watchlists (including the
        // automatic fallback after deleting the selected one) carries over
        // WatchlistPanel's internal state, like a "delete this watchlist?"
        // confirmation still showing for the *new* selection. Found by
        // actually deleting a watchlist and watching what happened next,
        // not by reading the code.
        <WatchlistPanel key={selected.id} watchlist={selected} />
      ) : (
        <div className="panel p-6 text-sm text-text-secondary">
          You don&apos;t have any watchlists yet -- create one above.
        </div>
      )}
    </div>
  );
}
