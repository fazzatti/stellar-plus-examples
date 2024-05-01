import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { ClassicAssetHandler } from "stellar-plus/lib/stellar-plus/asset";
import { StellarPlusErrorObject } from "stellar-plus/lib/stellar-plus/error/types";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";

export const noSignerDemo = async () => {
  // Define the network configuration to use
  const networkConfig = TestNet();

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as the source of a transaction
  // further down in the example.
  console.log("Creating a new account...");
  const account = new DefaultAccountHandler({ networkConfig });
  await account.initializeWithFriendbot();

  console.log("Account has been funded with 10,000 XLM");
  console.log("Account ID: ", account.getPublicKey());

  // Initialize a classic asset handler for XLM
  const xlm = new ClassicAssetHandler({
    networkConfig,
    code: "XLM",
  });

  // Create an object to hold the transaction configuration
  // for how the transaction should be executed from the previous account.
  // Here, we intentionally omit the signer for the transaction.
  const transactionConfig = {
    header: {
      source: account.getPublicKey(),
      fee: "100",
      timeout: 30,
    },
    signers: [], // <=== intentionally missing a signer
  };

  console.log(
    `Attempting to trigger a transaction from account ${account.getPublicKey()} without a signer...`
  );

  try {
    await xlm.transfer({
      from: account.getPublicKey(),
      to: account.getPublicKey(),
      amount: 100,
      ...transactionConfig,
    });
  } catch (error) {
    console.error(error as StellarPlusErrorObject);
  }
};
