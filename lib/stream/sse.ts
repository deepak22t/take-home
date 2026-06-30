type StreamTaskSummaryOptions = {
  signal: AbortSignal;
  onChunk: (chunk: string) => void;
  onDone?: () => void;
};
export async function streamSse(url: string, options: StreamTaskSummaryOptions): Promise<void> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
    },
    signal: options.signal,
    cache: "no-store",
  });
  if (!response.ok || !response.body) {
    throw new Error(`Unable to stream summary (${response.status}).`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const processFrame = (frame: string) => {
    const lines = frame.split("\n");
    let eventName = "message";
    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      }
      if (line.startsWith("data:")) {
        const payload = line.slice(5).trim();
        if (eventName === "done") {
          options.onDone?.();
          return;
        }
        options.onChunk(JSON.parse(payload) as string);
      }
    }
  };
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      if (frame.trim()) {
        processFrame(frame.trim());
      }
    }
  }
  if (buffer.trim()) {
    processFrame(buffer.trim());
  }
}
