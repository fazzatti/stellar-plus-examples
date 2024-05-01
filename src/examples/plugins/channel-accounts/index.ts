import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { ClassicAssetHandler } from "stellar-plus/lib/stellar-plus/asset";
import { ChannelAccounts } from "stellar-plus/lib/stellar-plus/channel-accounts";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";
import { TransactionInvocation } from "stellar-plus/lib/stellar-plus/types";
import { ClassicChannelAccountsPlugin } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/classic-transaction/channel-accounts";
import { FeeBumpWrapperPlugin } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/submit-transaction/fee-bump";

// This example demonstrates how to use a combination of
// channel accounts and fee bump to send multiple payments
// from a single account to another while ensuring that all costs
// are covered by the sender.
//
// This example relies on the following concepts:
// - Channel Accounts: A way to use multiple rotating accounts
//      to trigger parallel submission of transactions without managing a single
//      account's sequence number.
//  Doc: https://developers.stellar.org/docs/learn/encyclopedia/channel-accounts\
//
// - Fee Bump: A way to bundle a transaction within another transaction so that
//      the inner transaction fees can be paid by the outer transaction.
//
//  Doc: https://developers.stellar.org/docs/learn/encyclopedia/fee-bump-transactions
//
export const channelAccountsMintingDemo = async () => {
  // Define the network configuration to use
  const networkConfig = TestNet();

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as the sender of the payments
  //
  // Refer to the "Create Account" example for more details
  const sender = new DefaultAccountHandler({ networkConfig });
  await sender.initializeWithFriendbot();
  console.log("sender's account has been funded with 10,000 XLM");
  console.log("sender's account ID: ", sender.getPublicKey());

  // Create a new account and fund it with 10,000 XLM
  // This account will be used as a receiver of the new asset.
  //
  // Refer to the "Create Account" example for more details
  const receiver = new DefaultAccountHandler({ networkConfig });
  await receiver.initializeWithFriendbot();
  console.log("Receiver's account has been funded with 10,000 XLM");
  console.log("Receiver's account ID: ", receiver.getPublicKey());

  // Create a transaction configuration object that will be used
  // to configure the transactions that will be triggered by the sender.
  const senderTransactionConfig: TransactionInvocation = {
    header: {
      source: sender.getPublicKey(), // sender is covering the fees for this transaction
      fee: "100", // The maximum base fee for this transaction is 100 stroops per operation
      timeout: 30, // The transaction will expire after 30 seconds
    },
    signers: [sender], // sender is the signer for this transaction
  };

  // Open 10 channel accounts to be used for parallel transactions
  // This helper creates all accounts with 0 XLM and sponsored by the sender
  // to ensure all XLM costs are covered entirely by the sender.
  const channelAccounts = await ChannelAccounts.openChannels({
    networkConfig,
    sponsor: sender,
    numberOfChannels: 10,
    txInvocation: senderTransactionConfig,
  });

  // Instante a new classic asset handler forthe native XLM asset.
  //
  // Here a Channel Accounts Plugin is provided with the channels
  // we just opened. This ensures that all transactions triggered
  // by this asset handler will be submitted in parallel using the channel accounts.
  //
  // A Fee Bump Plugin is also provided to ensure that all transactions
  // sent by this handler will be wrapped in a fee bump transaction
  // that redirects the fees to the sender's account.
  const xlm = new ClassicAssetHandler({
    networkConfig,
    code: "XLM",
    options: {
      classicTransactionPipeline: {
        plugins: [
          new ClassicChannelAccountsPlugin({ channels: channelAccounts }),
          new FeeBumpWrapperPlugin(senderTransactionConfig),
        ],
      },
    },
  });

  const numberOfPayments = 50;
  console.log(
    `Triggering ${numberOfPayments} payments of 1 XLM from sender to receiver...`
  );

  // Trigger 50 payments of 1 XLM from sender to receiver in parallel
  const payments: Promise<void>[] = [];
  for (let i = 0; i < numberOfPayments; i++) {
    payments.push(
      xlm
        .transfer({
          from: sender.getPublicKey(),
          to: receiver.getPublicKey(),
          amount: 1,
          ...senderTransactionConfig,
        })
        .then(() => {
          console.log(`Payment ${i + 1} completed!`);
        })
    );
  }

  // Wait for all payments to complete
  await Promise.all(payments);
  console.log("All payments completed!");

  console.log(
    "Sender's new balance: ",
    await xlm.balance(sender.getPublicKey())
  );
  console.log(
    "Receiver's new balance: ",
    await xlm.balance(receiver.getPublicKey())
  );

  console.log("Closing channel accounts...");
  // Close all channel accounts to free up resources.
  // The accounts are all merged back into the sender account.
  await ChannelAccounts.closeChannels({
    channels: channelAccounts,
    sponsor: sender,
    txInvocation: senderTransactionConfig,
    networkConfig,
  });

  console.log("Channel accounts closed!");
};
