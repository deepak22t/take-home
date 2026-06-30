"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { TASK_STATUSES, TASK_TYPES, type SortDirection, type SortKey } from "@/lib/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTaskListMeta } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";

type FilterOption = {
  value: string;
  label: string;
};

function formatOptionLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-0 text-sm text-slate-700">
      <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`h-10 w-full rounded-2xl border pl-[4.75rem] pr-10 text-left text-sm text-slate-900 outline-none transition ${
          isOpen
            ? "border-slate-900 bg-white ring-2 ring-slate-200"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70"
        }`}
      >
        <span className="block truncate">{selectedOption?.label ?? ""}</span>
      </button>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
        <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}>
          <path d="M4.25 6.25 8 10l3.75-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </span>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
          <ul role="listbox" aria-label={label} className="scrollbar-hidden max-h-64 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isSelected ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const meta = useAppSelector(selectTaskListMeta);
  const typeOptions = useMemo<FilterOption[]>(
    () => [{ value: "all", label: "All Types" }, ...TASK_TYPES.map((type) => ({ value: type, label: formatOptionLabel(type) }))],
    []
  );
  const statusOptions = useMemo<FilterOption[]>(
    () => [{ value: "all", label: "All Statuses" }, ...TASK_STATUSES.map((status) => ({ value: status, label: formatOptionLabel(status) }))],
    []
  );
  const sortOptions = useMemo<FilterOption[]>(
    () => [
      { value: "updatedAt:desc", label: "Updated First" },
      { value: "updatedAt:asc", label: "Oldest First" },
      { value: "annotationCount:desc", label: "Most Annotations" },
      { value: "annotationCount:asc", label: "Fewest Annotations" },
    ],
    []
  );

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 sm:px-3.5 sm:py-3">
      <div className="grid items-start gap-2.5 md:grid-cols-4">
        <label className="relative block min-w-0 text-sm text-slate-700">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Search</span>
          <input
            value={meta.search}
            onChange={(event) => dispatch(tasksActions.setSearch(event.target.value))}
            placeholder="Search by title, id, or assignee"
            className="h-10 w-full rounded-2xl border border-slate-300 bg-white pl-[4.75rem] pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 hover:bg-slate-50/70 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <FilterSelect
          label="Type"
          value={meta.typeFilter}
          options={typeOptions}
          onChange={(value) => dispatch(tasksActions.setTypeFilter(value as (typeof TASK_TYPES)[number] | "all"))}
        />
        <FilterSelect
          label="Status"
          value={meta.statusFilter}
          options={statusOptions}
          onChange={(value) => dispatch(tasksActions.setStatusFilter(value as (typeof TASK_STATUSES)[number] | "all"))}
        />
        <FilterSelect
          label="Sort"
          value={`${meta.sortBy}:${meta.sortDirection}`}
          options={sortOptions}
          onChange={(value) => {
            const [sortBy, sortDirection] = value.split(":") as [SortKey, SortDirection];
            dispatch(tasksActions.setSort({ sortBy, sortDirection }));
          }}
        />
      </div>
    </div>
  );
}
