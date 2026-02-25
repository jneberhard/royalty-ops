import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as unknown as typeof WebSocket;
}

neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;