import { WebSocketServer } from "ws";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const PATH = "/ws";

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

const wss = new WebSocketServer({ port: PORT });

console.log(`[voice-agent-stub] listening on port ${PORT} (path ${PATH})`);

wss.on("connection", (ws, req) => {
  const url = req.url || "";
  if (!url.startsWith(PATH)) {
    ws.close(1008, "Invalid path");
    return;
  }

  ws.send(JSON.stringify({ type: "ready" }));

  let started = false;

  ws.on("message", (data, isBinary) => {
    if (isBinary) return;

    const msg = safeJsonParse(data.toString("utf8"));
    if (!msg || typeof msg.type !== "string") return;

    if (msg.type === "start") {
      started = true;
      ws.send(JSON.stringify({ type: "partial_transcript", text: "Listening…" }));
      return;
    }

    if (msg.type === "audio_chunk") {
      return;
    }

    if (msg.type === "stop") {
      if (!started) {
        ws.send(JSON.stringify({ type: "error", message: "Stop before start" }));
        return;
      }
      started = false;

      const finalText =
        "Texas Roadhouse, 123 Main St Dallas TX, phone 512-555-1212, hours 11am to 10pm";

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "final_transcript", text: finalText }));
      }, 200);
    }
  });

  ws.on("error", () => {});
});
