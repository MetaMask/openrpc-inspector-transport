import { Connect, SendData } from "../__GENERATED_TYPES__";
import MetaMaskTransport from "../transports/MetaMaskTransport";

export interface IMethodMapping {
  [methodName: string]: (...params: any) => Promise<any>;
}

let transport: MetaMaskTransport | undefined;
let internalID = 0;

const connect: Connect = async (uri) => {
  transport = new MetaMaskTransport(uri);
  return await transport.connect();
};

const sendData: SendData = (data) => {
  if (!transport) {
    throw new Error("Not Connected");
  }
  return transport.sendData({
    internalID: internalID++,
    request: data,
  });
};

const methodMapping: IMethodMapping = {
  connect,
  sendData,
};

export default methodMapping;
