import { Transport } from "@open-rpc/client-js/build/transports/Transport";
import { EventEmitter } from "events";
import { JSONRPCRequestData, IJSONRPCData } from "@open-rpc/client-js/build/Request";

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

interface EthereumProvider extends EventEmitter {
  isMetaMask?: boolean;
  request: (args: RequestArguments) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface ProviderMessage {
  readonly type: string;
  readonly data: unknown;
}

class MetaMaskTransport extends Transport {

  public async connect(): Promise<boolean> {
    const hasEthereum = window.ethereum && window.ethereum.isMetaMask;
    if (hasEthereum) {
      window.ethereum?.on("message", this.notificationHandler);
      return Boolean(hasEthereum);
    } else {
      throw new Error("No MetaMask Connection");
    }
  }

  public async sendData(data: JSONRPCRequestData, timeout: number | undefined = 5000): Promise<any> {
    const results = await window.ethereum?.request((data as IJSONRPCData).request);
    return results;
  }

  public close(): void {
    if (window.ethereum) {
      window.ethereum.off("message", this.notificationHandler);
    }
  }

  private notificationHandler = (message: ProviderMessage) => {
    const m: any = message;
    window.parent.postMessage({
      method: m.type,
      params: m.data,
    }, "*");
  }
}

export default MetaMaskTransport;
