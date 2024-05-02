import { account } from "./examples/account";
import { classicAsset } from "./examples/classic-asset";
import { classicTransactionPipeline } from "./examples/classic-pipeline";
import { contractEngine } from "./examples/contract-engine";
import { errorHandling } from "./examples/error-handling";
import { plugins } from "./examples/plugins";
import { RPC } from "./examples/rpc";
import { soroban } from "./examples/soroban";
import dotenv from "dotenv";

dotenv.config();

const examples = {
  account,
  classicAsset,
  classicTransactionPipeline,
  contractEngine,
  plugins,
  RPC,
  soroban,
  errorHandling,
};

examples.plugins.profiler();
