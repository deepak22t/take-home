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
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">AI Summary</h3>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{summaryEntry.status}</span>
      </div>
      {helperText ? (
        <p className={`mb-4 text-xs ${summaryEntry.status === "error" ? "text-rose-700" : "text-slate-500"}`}>{helperText}</p>
      ) : null}
      <div className="max-w-none rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm [&_a]:text-blue-700 [&_a]:underline [&_code]:font-mono [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_p]:leading-7 [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-slate-50 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6">
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
