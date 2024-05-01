import { channelAccountsMintingDemo } from "./channel-accounts";
import { transactXLMWithDebuggerDemo } from "./debugger";

export const plugins = {
  channelAccounts: {
    multipleMintingDemo: channelAccountsMintingDemo,
  },
  debugger: {
    loggingPipeline: transactXLMWithDebuggerDemo,
  },
};
