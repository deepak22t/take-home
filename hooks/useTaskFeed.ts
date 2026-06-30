"use client";
import { useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/client";
import type { TaskFeedEvent } from "@/lib/types/api";
import { useAppDispatch } from "@/store/hooks";
import { tasksActions } from "@/store/tasks/tasksSlice";
import { fetchTaskByIdThunk } from "@/store/tasks/tasksThunks";
type FeedStatus = "connecting" | "open" | "reconnecting" | "closed" | "error";
export function useTaskFeed(): FeedStatus {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<FeedStatus>("connecting");
  const reconnectAttempts = useRef(0);
  const pendingTaskFetches = useRef(new Set<string>());
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let isDisposed = false;
    const ensureTaskHydrated = (taskId: string) => {
      if (pendingTaskFetches.current.has(taskId)) {
        return;
      }
      pendingTaskFetches.current.add(taskId);
      void dispatch(fetchTaskByIdThunk(taskId)).finally(() => {
        pendingTaskFetches.current.delete(taskId);
      });
    };

    const connect = () => {
      if (isDisposed) {
        return;
      }
      setStatus(reconnectAttempts.current === 0 ? "connecting" : "reconnecting");
      socket = new WebSocket(`${getApiBaseUrl().replace(/^http/, "ws")}/ws`);
      socket.addEventListener("open", () => {
        reconnectAttempts.current = 0;
        setStatus("open");
      });
      socket.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data) as TaskFeedEvent;
          if (message.kind === "task.updated" && typeof message.payload.id === "string") {
            dispatch(
              tasksActions.mergeTaskUpdatedEvent({
                id: message.payload.id,
                status: message.payload.status,
                updatedAt: message.payload.updatedAt,
              })
            );
            ensureTaskHydrated(message.payload.id);
          }
          if (message.kind === "task.assigned" && typeof message.payload.id === "string") {
            dispatch(
              tasksActions.mergeTaskAssignedEvent({
                id: message.payload.id,
                assignee: message.payload.assignee,
              })
            );
            ensureTaskHydrated(message.payload.id);
          }
          if (message.kind === "annotation.created" && typeof message.payload.taskId === "string") {
            dispatch(
              tasksActions.mergeAnnotationCreatedEvent({
                taskId: message.payload.taskId,
                at: message.payload.at,
              })
            );
            ensureTaskHydrated(message.payload.taskId);
          }
        } catch {
          setStatus("error");
        }
      });
      socket.addEventListener("close", () => {
        if (isDisposed) {
          setStatus("closed");
          return;
        }
        reconnectAttempts.current += 1;
        reconnectTimer = window.setTimeout(connect, Math.min(4000, reconnectAttempts.current * 1000));
      });
      socket.addEventListener("error", () => {
        setStatus("error");
      });
    };
    connect();
    return () => {
      isDisposed = true;
      setStatus("closed");
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      pendingTaskFetches.current.clear();
      socket?.close();
    };
  }, [dispatch]);
  return status;
}
