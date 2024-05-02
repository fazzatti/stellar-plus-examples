import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { ClassicTransactionPipeline } from "stellar-plus/lib/stellar-plus/core/pipelines/classic-transaction";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";
import { Operation, Asset } from "@stellar/stellar-sdk";
import { ClassicAssetHandler } from "stellar-plus/lib/stellar-plus/asset";

export const multipleClassicPaymentsDemo = async () => {
  // Define the network configuration to use
  const networkConfig = TestNet();

  console.log("\nCreating and funding accounts for the payments...");
  // Create and initialize accounts for the payments
  const accountA = new DefaultAccountHandler({ networkConfig });
  const accountB = new DefaultAccountHandler({ networkConfig });
  const accountC = new DefaultAccountHandler({ networkConfig });
  const accountD = new DefaultAccountHandler({ networkConfig });
  const accountE = new DefaultAccountHandler({ networkConfig });
  const promises = [
    accountA.initializeWithFriendbot(),
    accountB.initializeWithFriendbot(),
    accountC.initializeWithFriendbot(),
    accountD.initializeWithFriendbot(),
    accountE.initializeWithFriendbot(),
  ];
  await Promise.all(promises);
  console.log("Accounts created and funded successfully!\n");

  console.log("Account A: ", accountA.getPublicKey());
  console.log("Account B: ", accountB.getPublicKey());
  console.log("Account C: ", accountC.getPublicKey());
  console.log("Account D: ", accountD.getPublicKey());
  console.log("Account E: ", accountE.getPublicKey());

  // Instantiate a new ClassicTransactionPipeline
  // with the network configuration.
  //
  // This instance will be used to execute the payments.
  const classicPipeline = new ClassicTransactionPipeline(networkConfig);

  // Define the payment operations to execute
  //  - Account A sends 100 XLM to Account B
  //  - Account A sends 50 XLM to Account C
  //  - Account C sends 10 XLM to Account D
  //  - Account E sends 75 XLM to Account A
  //  - Account C sends 40 XLM to Account B
  const paymentOperations = [
    Operation.payment({
      source: accountA.getPublicKey(),
      destination: accountB.getPublicKey(),
      asset: Asset.native(),
      amount: "100",
    }),
    Operation.payment({
      source: accountA.getPublicKey(),
      destination: accountC.getPublicKey(),
      asset: Asset.native(),
      amount: "50",
    }),
    Operation.payment({
      source: accountC.getPublicKey(),
      destination: accountD.getPublicKey(),
      asset: Asset.native(),
      amount: "10",
    }),
    Operation.payment({
      source: accountE.getPublicKey(),
      destination: accountA.getPublicKey(),
      asset: Asset.native(),
      amount: "75",
    }),
    Operation.payment({
      source: accountC.getPublicKey(),
      destination: accountB.getPublicKey(),
      asset: Asset.native(),
      amount: "40",
    }),
  ];

  // Execute the payment operations
  // using the ClassicTransactionPipeline instance
  console.log("\nExecuting 5 payments...");
  await classicPipeline.execute({
    operations: paymentOperations,
    txInvocation: {
      header: {
        source: accountA.getPublicKey(),
        fee: "10000000", //1XLM
        timeout: 45,
      },
      signers: [accountA, accountC, accountE],
    },
  });
  console.log("\nPayments executed successfully!");

  // instantiate a new ClassicAssetHandler
  // to fetch the account balances for the XLM asset
  const xlm = new ClassicAssetHandler({ networkConfig, code: "XLM" });

  console.log(
    "\nAccount A balance: ",
    await xlm.balance(accountA.getPublicKey())
  );
  console.log(
    "Account B balance: ",
    await xlm.balance(accountB.getPublicKey())
  );
  console.log(
    "Account C balance: ",
    await xlm.balance(accountC.getPublicKey())
  );
  console.log(
    "Account D balance: ",
    await xlm.balance(accountD.getPublicKey())
  );
  console.log(
    "Account E balance: ",
    await xlm.balance(accountE.getPublicKey())
  );
};
