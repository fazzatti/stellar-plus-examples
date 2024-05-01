import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { ClassicAssetHandler } from "stellar-plus/lib/stellar-plus/asset";
import { StellarPlusErrorObject } from "stellar-plus/lib/stellar-plus/error/types";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";

export const missingASignerDemo = async () => {
  // Define the network configuration to use
  const networkConfig = TestNet();

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as the source of a transaction
  // further down in the example.
  console.log("Creating a new sender account...");
  const sender = new DefaultAccountHandler({ networkConfig });
  await sender.initializeWithFriendbot();
  console.log("sender has been funded with 10,000 XLM");
  console.log("sender ID: ", sender.getPublicKey());

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as the receiver of the transaction
  // further down in the example.
  console.log("Creating a new receiver account...");
  const receiver = new DefaultAccountHandler({ networkConfig });
  await receiver.initializeWithFriendbot();
  console.log("receiver has been funded with 10,000 XLM");
  console.log("receiver ID: ", receiver.getPublicKey());

  // Initialize a classic asset handler for XLM
  const xlm = new ClassicAssetHandler({
    networkConfig,
    code: "XLM",
  });

  // Create an object to hold the transaction configuration
  // for how the transaction should be executed so that the receiver
  // is supposed to cover the fees for this transaction.
  // Here, we intentionally omit the signer for the transaction.
  const transactionConfig = {
    header: {
      source: receiver.getPublicKey(),
      fee: "100",
      timeout: 30,
    },
    signers: [], // <=== intentionally missing a signer
  };

  console.log(
    `Attempting to trigger a transaction without one of the signers... 
- sender ${sender.getPublicKey()} : added as signer
- receiver ${receiver.getPublicKey()} : missing as signer`
  );

  try {
    await xlm.transfer({
      from: sender.getPublicKey(),
      to: receiver.getPublicKey(),
      amount: 100,
      ...transactionConfig,
      signers: [sender], // <=== adding the sender as a signer but leaving out the receiver
    });
  } catch (error) {
    console.error(error as StellarPlusErrorObject);
  }
};
