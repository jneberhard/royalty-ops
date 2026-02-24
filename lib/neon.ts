import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as any;
}

neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;