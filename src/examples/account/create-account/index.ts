import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";

// This example uses a simple account handler to create an account and fund it
// using the friendbot available in the test network.
export const creatingAnAccountDemo = async () => {
  // Select which network configuration to use.
  // Here a predefined configuration for the test network is used.
  const networkConfig = TestNet();

  // Instantiate the account handler with the network configuration.
  // This handler simply manages the keys with no security approach.
  //
  // When no secret key is provided, a new key pair is generated.
  const account = new DefaultAccountHandler({ networkConfig });

  // We use the friendbot available for testnet that is defined in
  // the network configuration to initialize and fund the account.
  await account.initializeWithFriendbot();

  console.log("Account created and funded successfully!");

  // Print the public key
  console.log("Public key:", account.getPublicKey());

  // Fetch all balances for the account and print the XLM balance
  console.log(
    "XLM Balance",
    (await account.getBalances()).find((bal) => bal.asset_type === "native")
      ?.balance
  );
};
