import { channelAccountsMintingDemo } from "./channel-accounts";
import { transactXLMWithDebuggerDemo } from "./debugger";
import { profilerPluginDemo } from "./profiler";

export const plugins = {
  channelAccounts: {
    multipleMintingDemo: channelAccountsMintingDemo,
  },
  debugger: {
    loggingPipeline: transactXLMWithDebuggerDemo,
  },
  profiler: profilerPluginDemo,
};
