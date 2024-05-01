import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";
import { loadWasmFile } from "../../../utils";
import { SorobanTokenHandler } from "stellar-plus/lib/stellar-plus/asset";
import { connect } from "http2";
import { SimulatedInvocationOutput } from "stellar-plus/lib/stellar-plus/core/pipelines/simulate-transaction/types";
import { ValidationCloudRpcHandler } from "stellar-plus/lib/stellar-plus/rpc";

// This use case demonstrates the same use case as under the "Soroban Token" example
// but using the Validation Cloud API as RPC solution.
// Requirements:
// - Register and create a testnet api key at https://app.validationcloud.io/
// - Set the API key in the environment variable "VALIDATION_CLOUD_API_KEY"
export const sorobanTokenWithValidationCloudDemo = async () => {
  // Retrieve the Validation Cloud API key from the environment
  const vcApiKey = process.env.VALIDATION_CLOUD_API_KEY;
  if (!vcApiKey) {
    throw new Error("Missing 'VALIDATION_CLOUD_API_KEY' environment variable");
  }

  // Define the network configuration to use
  const networkConfig = TestNet();

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as the issuer and administrator
  // of the new asset
  //
  // Refer to the "Create Account" example for more details
  const issuer = new DefaultAccountHandler({ networkConfig });
  await issuer.initializeWithFriendbot();
  console.log("Issuer's account has been funded with 10,000 XLM");
  console.log("Issuer's account ID: ", issuer.getPublicKey());

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as a receiver of the new asset.
  //
  // Refer to the "Create Account" example for more details
  const receiver = new DefaultAccountHandler({ networkConfig });
  await receiver.initializeWithFriendbot();
  console.log("Receiver's account has been funded with 10,000 XLM");
  console.log("Receiver's account ID: ", receiver.getPublicKey());

  // Load the wasm file containing
  // the token contract code
  const wasmBuffer = await loadWasmFile(
    "./src/wasm-files/token/soroban_token_contract.wasm"
  );

  // Create a transaction configuration object that will be used
  // to configure the transactions that will be triggered by the issuer.
  const transactionConfig = {
    header: {
      source: issuer.getPublicKey(),
      fee: "100",
      timeout: 30,
    },
    signers: [issuer],
  };

  // Instantiate a new Validation Cloud RPC Handler with
  // the network configuration and the API key
  // to manage the RPC calls.
  const validationCloudRpc = new ValidationCloudRpcHandler(
    networkConfig,
    vcApiKey
  );

  // Instantiate a new Soroban Token Handler
  // to manage the new token leveraging a
  // ContractEngine.
  //
  // Pass the custom RPC handler to the Soroban transaction pipeline
  // to use the Validation Cloud API as RPC solution.
  const token = new SorobanTokenHandler({
    networkConfig,
    contractParameters: {
      wasm: wasmBuffer,
    },
    options: {
      sorobanTransactionPipeline: {
        customRpcHandler: validationCloudRpc,
      },
    },
  });

  // Upload the contract code to the network.
  // This step will provide a wasm hash that
  // will be used to identify the code and
  // can be used to deploy instances of the contract.
  await token.uploadWasm(transactionConfig);
  console.log("Contract code uploaded to the network");
  console.log("Wasm hash: ", token.getWasmHash());

  // Deploy a new instance of the contract.
  await token.deploy(transactionConfig);
  console.log("Contract deployed to the network");
  console.log("Contract address: ", token.getContractId());

  // Initialize the contract with the issuer as the owner
  await token.initialize({
    admin: issuer.getPublicKey(),
    symbol: "FIFOTOKEN",
    name: "FIFO Token",
    decimal: 7,
    ...transactionConfig,
  });

  console.log("Contract initialized");

  // Mint new units to the receiver
  await token.mint({
    to: receiver.getPublicKey(),
    amount: BigInt(1000),
    ...transactionConfig,
  });
  console.log("1000 units minted to receiver");

  // Use the contract 'balance' function to retrieve the receiver's balance.
  // As this is a 'get' function that does not modify the contract state,
  // the contract engine will execute only a simulation of the transaction and
  // return the result. This ensures a fast response time with no fees.
  console.log(
    "Receiver's new balance: ",
    await token.balance({
      id: receiver.getPublicKey(),
      ...transactionConfig,
    })
  );
};
