import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { ClassicAssetHandler } from "stellar-plus/lib/stellar-plus/asset";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";

// This example demonstrates how to create a
// new asset and mint some units of it to a
// receiver's account.
export const createAssetDemo = async () => {
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
  // Refer to the "Create Account" example for more details
  const receiver = new DefaultAccountHandler({ networkConfig });
  await receiver.initializeWithFriendbot();
  console.log("Receiver's account has been funded with 10,000 XLM");
  console.log("Receiver's account ID: ", receiver.getPublicKey());

  // Instante a new classic asset handler for the new asset.
  // The handler will be used to create, issue, and manage the asset.
  //
  // Since an accounte handler is provided instead of just a public key,
  // the asset will enable administrative operations and automatically
  // sign transactions on behalf of the issuer.
  const usdToken = new ClassicAssetHandler({
    networkConfig,
    code: "USD",
    issuerAccount: issuer,
  });

  console.log(
    "Adding a trustline and minting 1000 units to the receiver's account..."
  );
  // Add a trustline to the receiver's account and
  // mint 1000 units of the asset to it.
  // The trustline will allow the receiver to hold the asset.
  await usdToken.addTrustlineAndMint({
    to: receiver.getPublicKey(),
    amount: 1000,
    header: {
      source: issuer.getPublicKey(),
      fee: "100",
      timeout: 30,
    },
    signers: [receiver],
  });

  console.log("Trustline added and 1000 units minted!");
  console.log(
    "Receiver's new USD balance: ",
    await usdToken.balance(receiver.getPublicKey())
  );
};
