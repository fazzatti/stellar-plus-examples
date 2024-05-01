import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { ClassicAssetHandler } from "stellar-plus/lib/stellar-plus/asset";
import { ClassicTransactionPipelinePlugin } from "stellar-plus/lib/stellar-plus/core/pipelines/classic-transaction/types";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";
import { TransactionInvocation } from "stellar-plus/lib/stellar-plus/types";
import { DebugPlugin } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/generic/debug";

// This example demonstrates how the debugger plugin can be used to
// gather information about the transaction execution process from within
// a pipeline.
//
// The use case for this example is the same as in the "Transact XLM" example,
export const transactXLMWithDebuggerDemo = async () => {
  // Define the network configuration to use
  const networkConfig = TestNet();

  // Create two new accounts and fund them with 10,000 XLM each
  // Refer to the "Create Account" example for more details
  const john = new DefaultAccountHandler({ networkConfig });
  await john.initializeWithFriendbot();
  console.log("John's account has been funded with 10,000 XLM");
  console.log("John's account ID: ", john.getPublicKey());

  const amy = new DefaultAccountHandler({ networkConfig });
  await amy.initializeWithFriendbot();
  console.log("Amy's account has been funded with 10,000 XLM");
  console.log("Amy's account ID: ", amy.getPublicKey());

  // Initialize a classic asset handler for XLM
  const xlm = new ClassicAssetHandler({
    networkConfig,
    code: "XLM",
    options: {
      classicTransactionPipeline: {
        plugins: [
          // Add the debugger plugin to the pipeline
          new DebugPlugin("all") as ClassicTransactionPipelinePlugin,
        ],
      },
    },
  });

  // Create an object to hold the general configuration
  // for how the transaction should be executed.
  const transactionConfig: TransactionInvocation = {
    header: {
      source: john.getPublicKey(), // John is covering the fees for this transaction
      fee: "100", // The maximum base fee for this transaction is 100 stroops per operation
      timeout: 30, // The transaction will expire after 30 seconds
    },
    signers: [john], // John is the only signer for this transaction
  };

  console.log("Sending 100 XLM from John to Amy...");

  // Use the xlm handler to send 100 XLM from John to Amy
  // The transaction will be built based on the provided parameters.
  // When the time comes, John's account handler will be used
  // to sign the transaction and authorize the transaction.
  await xlm.transfer({
    from: john.getPublicKey(),
    to: amy.getPublicKey(),
    amount: 100,
    ...transactionConfig,
  });

  console.log("Transaction complete!");
  console.log("John's new balance: ", await xlm.balance(john.getPublicKey()));
  console.log("Amy's new balance: ", await xlm.balance(amy.getPublicKey()));
};
