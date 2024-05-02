import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";
import { loadWasmFile } from "../../../utils";
import { SorobanTokenHandler } from "stellar-plus/lib/stellar-plus/asset";
import { ProfilerPlugin } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/soroban-transaction/profiler";

// This example demonstrates how to use the ProfilerPlugin
// to collect information about the transactions executed
// in the pipeline and output it in a csv format.
export const profilerPluginDemo = async () => {
  // Define the network configuration to use
  const networkConfig = TestNet();

  console.log("\nCreating and funding admin account");
  const admin = new DefaultAccountHandler({ networkConfig });
  await admin.initializeWithFriendbot();
  console.log("Admin account created: ", admin.getPublicKey());

  console.log("\nCreating and funding user account");
  const user = new DefaultAccountHandler({ networkConfig });
  await user.initializeWithFriendbot();
  console.log("User account created: ", user.getPublicKey());

  const adminTxInvocation = {
    header: {
      source: admin.getPublicKey(),
      fee: "10000000",
      timeout: 45,
    },
    signers: [admin],
  };

  const contractWasmBuffer = await loadWasmFile(
    "./src/wasm-files/token/soroban_token_contract.wasm"
  );

  const profiler = new ProfilerPlugin();

  const token = new SorobanTokenHandler({
    networkConfig,
    contractParameters: {
      wasm: contractWasmBuffer,
    },
    options: {
      sorobanTransactionPipeline: {
        plugins: [profiler],
      },
    },
  });

  console.log("\nUploading wasm to the network...");
  await token.uploadWasm(adminTxInvocation);
  console.log("Contract code uploaded to the network");
  console.log("Wasm hash: ", token.getWasmHash());

  console.log("\nDeploying contract to the network...");
  await token.deploy(adminTxInvocation);
  console.log("Contract deployed to the network");
  console.log("Contract address: ", token.getContractId());

  await token.initialize({
    admin: admin.getPublicKey(),
    symbol: "FIFOTOKEN",
    name: "FIFO Token",
    decimal: 7,
    ...adminTxInvocation,
  });

  console.log("Contract initialized");

  await token.mint({
    to: user.getPublicKey(),
    amount: BigInt(1000),
    ...adminTxInvocation,
  });
  console.log("1000 units minted to user");

  // Print the profiler summary
  // This will show the information collected from
  // the transactions executed in the pipeline
  // and output it in a csv format
  console.log("\nProfiler summary:");
  console.log(
    profiler.data.getLog({
      formatOutput: "csv",
    })
  );
};
