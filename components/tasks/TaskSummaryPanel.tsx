"use client";
import { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { getApiBaseUrl } from "@/lib/api/client";
import { streamSse } from "@/lib/stream/sse";
import type { Task } from "@/lib/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { summaryActions } from "@/store/summary/summarySlice";
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    "a",
    "blockquote",
    "br",
    "code",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "ul",
  ],
  attributes: {
    a: ["href", "title", "target", "rel"],
    code: ["className"],
  },
};
export function TaskSummaryPanel({ task }: { task: Task }) {
  const dispatch = useAppDispatch();
  const summaryEntry = useAppSelector((state) =>
    state.summary.byTaskId[task.id] ?? { content: "", status: "idle", error: null, updatedAt: null }
  );
  const statusBadgeClass = useMemo(() => {
    if (summaryEntry.status === "success") {
      return "text-emerald-600";
    }
    if (summaryEntry.status === "error") {
      return "text-rose-600";
    }
    if (summaryEntry.status === "streaming") {
      return "text-slate-600";
    }
    return "text-slate-500";
  }, [summaryEntry.status]);
  useEffect(() => {
    const controller = new AbortController();
    dispatch(summaryActions.summaryRequested(task.id));
    void streamSse(`${getApiBaseUrl()}/api/tasks/${task.id}/summary`, {
      signal: controller.signal,
      onChunk: (chunk) => dispatch(summaryActions.summaryChunkReceived({ taskId: task.id, chunk })),
      onDone: () => dispatch(summaryActions.summaryCompleted(task.id)),
    }).catch((error) => {
      if (controller.signal.aborted) {
        dispatch(summaryActions.summaryCancelled(task.id));
        return;
      }
      dispatch(
        summaryActions.summaryFailed({
          taskId: task.id,
          error: error instanceof Error ? error.message : "Unable to stream task summary.",
        })
      );
    });
    return () => {
      controller.abort();
      dispatch(summaryActions.summaryCancelled(task.id));
    };
  }, [dispatch, task.id]);
  const helperText = useMemo(() => {
    if (summaryEntry.status === "loading") {
      return "Opening summary stream...";
    }
    if (summaryEntry.status === "streaming") {
      return "Streaming markdown safely as it arrives.";
    }
    if (summaryEntry.status === "error") {
      return summaryEntry.error ?? "Summary stream failed.";
    }
    return "";
  }, [summaryEntry.error, summaryEntry.status]);
  return (
    <section className="px-5 py-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">AI Summary</h3>
        <span className={`inline-flex text-[11px] font-semibold uppercase tracking-[0.16em] ${statusBadgeClass}`}>{summaryEntry.status}</span>
      </div>
      {helperText ? (
        <p className={`mb-3 text-xs ${summaryEntry.status === "error" ? "text-rose-700" : "text-slate-500"}`}>{helperText}</p>
      ) : null}
      <div className="max-w-none rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-900 [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-slate-800 [&_h1]:mb-2.5 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2.5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2.5 [&_p]:leading-6 [&_pre]:mb-2.5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-50 [&_pre]:p-3 [&_pre]:text-slate-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-6">
        {summaryEntry.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}>
            {summaryEntry.content}
          </ReactMarkdown>
        ) : (
          <p className="m-0 text-sm text-slate-500">No summary received yet.</p>
        )}
      </div>
    </section>
  );
}
