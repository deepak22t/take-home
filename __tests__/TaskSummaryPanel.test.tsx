import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import { TaskSummaryPanel } from "@/components/tasks/TaskSummaryPanel";
import { streamSse } from "@/lib/stream/sse";
import type { Task } from "@/lib/types/task";
import summaryReducer from "@/store/summary/summarySlice";
import tasksReducer from "@/store/tasks/tasksSlice";

jest.mock("@/lib/stream/sse", () => ({
  streamSse: jest.fn(),
}));

const mockStreamSse = jest.mocked(streamSse);

describe("TaskSummaryPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders streamed markdown while stripping unsafe HTML", async () => {
    mockStreamSse.mockImplementation(async (_url, { onChunk, onDone }) => {
      onChunk(
        [
          "# Task Summary",
          "",
          "Safe summary paragraph.",
          "",
          "```ts",
          "const score = computeQuality(task);",
          "```",
          "",
          "<script>window.__bad = true;</script>",
        ].join("\n")
      );
      onDone?.();
    });

    const task = {
      id: "t1",
      title: "Review dataset",
      type: "text",
      status: "qa",
      rawStatus: "qa",
      assignee: null,
      annotationCount: 5,
      updatedAt: 1719600000000,
      meta: {},
      rawType: "text",
      isPartial: false,
      warnings: [],
    } satisfies Task;

    const store = configureStore({
      reducer: {
        tasks: tasksReducer,
        summary: summaryReducer,
      },
    });

    render(
      <Provider store={store}>
        <TaskSummaryPanel task={task} />
      </Provider>
    );

    await waitFor(() => {
      expect(mockStreamSse).toHaveBeenCalledWith(
        "http://localhost:4000/api/tasks/t1/summary",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
          onChunk: expect.any(Function),
          onDone: expect.any(Function),
        })
      );
    });

    expect(await screen.findByText("Safe summary paragraph.")).toBeInTheDocument();
    expect(screen.getByText(/const score = computeQuality\(task\);/)).toBeInTheDocument();
    expect(screen.getByText("success")).toBeInTheDocument();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });
});
