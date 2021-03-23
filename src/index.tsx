import openrpcDocument from "./openrpc.json";
import methodMapping from "./methods/methodMapping";

window.addEventListener("message", async (ev: MessageEvent) => {
  if (ev.data.method === "rpc.discover") {
    (ev.source as any).postMessage({
      jsonrpc: "2.0",
      result: openrpcDocument,
      id: ev.data.id,
    }, ev.origin);
    return;
  }
  if (!methodMapping[ev.data.method]) {
    window.parent.postMessage({
      jsonrpc: "2.0",
      error: {
        code: 32009,
        message: "Method not found",
      },
      id: ev.data.id,
    }, ev.origin);
    return;
  }
  methodMapping[ev.data.method](...ev.data.params, ev.origin).then((results: any) => {
    window.parent.postMessage({
      jsonrpc: "2.0",
      result: results,
      id: ev.data.id,
    }, ev.origin);
  }).catch((e: Error) => {
    (ev.source as any).postMessage({
      jsonrpc: "2.0",
      error: {
        code: 32329,
        message: e.message,
      },
      id: ev.data.id,
    }, ev.origin);
  });
});

export default {};
