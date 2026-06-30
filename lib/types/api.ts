export type RawTaskType = string | null | undefined;
export type RawTaskStatus = string | null | undefined;
export type RawAssignee =
  | {
      id?: unknown;
      name?: unknown;
    }
  | null
  | undefined;
export type RawTask = {
  id?: unknown;
  title?: unknown;
  type?: RawTaskType;
  status?: RawTaskStatus;
  assignee?: RawAssignee;
  annotationCount?: unknown;
  updatedAt?: unknown;
  meta?: unknown;
};
export type RawTaskListResponse = {
  page?: unknown;
  pageSize?: unknown;
  total?: unknown;
  items?: unknown;
};
export type TaskUpdatedEvent = {
  kind: "task.updated";
  payload: {
    id?: unknown;
    status?: unknown;
    updatedAt?: unknown;
  };
};
export type TaskAssignedEvent = {
  kind: "task.assigned";
  payload: {
    id?: unknown;
    assignee?: RawAssignee;
  };
};
export type AnnotationCreatedEvent = {
  kind: "annotation.created";
  payload: {
    taskId?: unknown;
    by?: unknown;
    at?: unknown;
  };
};
export type TaskFeedEvent = TaskUpdatedEvent | TaskAssignedEvent | AnnotationCreatedEvent;
