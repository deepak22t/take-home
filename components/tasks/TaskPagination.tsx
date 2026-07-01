"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTaskListMeta } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";

function PageSizeSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(() => [10, 20, 50], []);

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
    <div ref={containerRef} className="relative min-w-[4.25rem]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`h-9 w-full rounded-xl border px-2 pr-7 text-left text-sm text-slate-900 outline-none transition ${
          isOpen
            ? "border-slate-900 bg-white ring-2 ring-slate-200"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/70"
        }`}
      >
        {value}
      </button>
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-400">
        <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}>
          <path d="M4.25 6.25 8 10l3.75-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </span>
      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.3rem)] z-30 min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
          <ul role="listbox" aria-label="Page size" className="scrollbar-hidden max-h-40 overflow-y-auto">
            {options.map((size) => {
              const isSelected = size === value;
              return (
                <li key={size}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(size);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition ${
                      isSelected ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {size}
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

export function TaskPagination() {
  const dispatch = useAppDispatch();
  const meta = useAppSelector(selectTaskListMeta);
  const isFetching = Boolean(meta.activeListRequestId) && (meta.loading === "loading" || meta.loading === "refreshing");
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(meta.total, meta.page * meta.pageSize);

  useEffect(() => {
    if (!isFetching) {
      setLoadingSeconds(0);
      return;
    }
    const startedAt = Date.now();
    setLoadingSeconds(0);
    const timer = window.setInterval(() => {
      setLoadingSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [isFetching, meta.activeListRequestId]);
  return (
    <div className="mt-3.5 flex flex-col gap-2.5 border-t border-slate-200 pt-3.5 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-700">Page {meta.page} of {totalPages}</span>
        <span className="text-slate-500">
          Showing {rangeStart}-{rangeEnd} of {meta.total}
        </span>
        {isFetching ? (
          <span className="inline-flex items-center gap-2 text-slate-500">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" aria-hidden="true" />
            Loading… {loadingSeconds}s
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm font-medium text-slate-600">Page size</span>
          <PageSizeSelect value={meta.pageSize} onChange={(size) => dispatch(tasksActions.setPageSize(size))} />
        </label>
        <button
          type="button"
          onClick={() => dispatch(tasksActions.setPage(Math.max(1, meta.page - 1)))}
          disabled={meta.page <= 1 || isFetching}
          className="h-9 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => dispatch(tasksActions.setPage(Math.min(totalPages, meta.page + 1)))}
          disabled={meta.page >= totalPages || isFetching}
          className="h-9 rounded-xl bg-slate-800 px-4 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
