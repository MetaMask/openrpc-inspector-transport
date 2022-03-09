import openrpcDocument from "./openrpc.json";
import methodMapping from "./methods/methodMapping";
import {EthereumRpcError, serializeError} from "eth-rpc-errors";

window.addEventListener("message", async (ev: MessageEvent) => {
  if (!ev.data.jsonrpc) {
    return;
  }

  const eventSource: Window = ev.source as Window;

  if (ev.data.method === "rpc.discover") {
    eventSource.postMessage({
      jsonrpc: "2.0",
      result: openrpcDocument,
      id: ev.data.id,
    }, ev.origin);
    return;
  }
  if (!methodMapping[ev.data.method]) {
    eventSource.postMessage({
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
    eventSource.postMessage({
      jsonrpc: "2.0",
      result: results,
      id: ev.data.id,
    }, ev.origin);
  }).catch((e: EthereumRpcError<any>) => {
    eventSource.postMessage({
      jsonrpc: "2.0",
      error: serializeError(e, { shouldIncludeStack: true }),
      id: ev.data.id,
    }, ev.origin);
  });
});

export default {};
