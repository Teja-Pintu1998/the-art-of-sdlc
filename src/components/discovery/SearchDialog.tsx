"use client";

import { type KeyboardEvent, useId, useRef, useState } from "react";

import { ModalDialog } from "@/components/ui/ModalDialog";
import { searchStations } from "@/lib/map/search";
import { PHASES } from "@/lib/map/stations";

type Props = {
  availableIds: readonly number[];
  /** Jump to a station. */
  onSelect: (id: number) => void;
  onClose: () => void;
  returnFocusTo: () => HTMLElement | null | undefined;
};

/** Search / quick jump (AOS-6.2): an accessible combobox; Enter or a click jumps to the station. */
export function SearchDialog({ availableIds, onSelect, onClose, returnFocusTo }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = searchStations(query, availableIds);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const optionId = (i: number) => `${listId}-${i}`;

  const move = (delta: number) => {
    if (results.length === 0) return;
    const next = (active + delta + results.length) % results.length;
    setActive(next);
    document.getElementById(optionId(next))?.scrollIntoView?.({ block: "nearest" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      onSelect(results[active].id);
    }
  };

  return (
    <ModalDialog
      labelledBy="search-title"
      onClose={onClose}
      testId="search-dialog"
      returnFocusTo={returnFocusTo}
      className="max-w-lg text-left"
      top
    >
      <h2 id="search-title" className="font-heading text-lg font-semibold">
        Find a station
      </h2>
      <input
        data-autofocus
        type="text"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-activedescendant={results[active] ? optionId(active) : undefined}
        aria-autocomplete="list"
        aria-label="Search stations"
        placeholder="Try “canary”, “PRD” or a number"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-yellow-300"
      />
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Stations"
        className="mt-3 max-h-[50dvh] overflow-y-auto"
      >
        {results.map((st, i) => {
          const locked = !availableIds.includes(st.id);
          const phase = PHASES[st.phase - 1]!;
          return (
            <li
              key={st.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => onSelect(st.id)}
              className="cursor-pointer rounded-lg px-3 py-2 aria-selected:bg-slate-800"
            >
              <span className="font-semibold">
                #{st.id} {st.name}
              </span>
              {locked && <span className="text-muted"> · 🔒 Coming soon</span>}
              <span className="block text-sm" style={{ color: phase.color }}>
                {phase.name}
              </span>
            </li>
          );
        })}
      </ul>
      {/* Always present, so screen readers announce changes (a newly inserted live region often isn't). */}
      <p role="status" className={results.length === 0 ? "mt-3 text-base text-muted" : "sr-only"}>
        {results.length === 0
          ? `No station matches “${query}”.`
          : `${results.length} station${results.length === 1 ? "" : "s"}`}
      </p>
      <p className="mt-3 text-xs text-muted">↑ ↓ to choose · Enter to jump · Esc to close</p>
    </ModalDialog>
  );
}
