import { account } from "./examples/account";
import { classicAsset } from "./examples/classic-asset";
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
  contractEngine,
  plugins,
  RPC,
  soroban,
  errorHandling,
};

examples.contractEngine.governanceHubDemo();
