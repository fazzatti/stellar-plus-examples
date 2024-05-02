import { DefaultAccountHandler } from "stellar-plus/lib/stellar-plus/account";
import { TestNet } from "stellar-plus/lib/stellar-plus/network";
import { ContractSpec } from "@stellar/stellar-sdk";
import { ContractEngine } from "stellar-plus/lib/stellar-plus/core/contract-engine";
import { loadWasmFile } from "../../../utils";
import { DebugPlugin } from "stellar-plus/lib/stellar-plus/utils/pipeline/plugins/generic/debug";
import { SorobanAuthPipelinePlugin } from "stellar-plus/lib/stellar-plus/core/pipelines/soroban-auth/types";
import { StellarPlus } from "stellar-plus";

// Specification of the contract interface. Contains the encoded data
// of the contract methods and their parameters. This is used by the
// ContractEngine to know how to interact with the contract.
//
// This was generated using the generate bindings feature from
// the Soroban CLI tool
//
const ghSpec = new ContractSpec([
  "AAAAAwAAAAAAAAAAAAAABVJvbGVzAAAAAAAAAwAAAAAAAAANTm90QXV0aG9yaXplZAAAAAAAAAAAAAAAAAAAClN1cGVyQWRtaW4AAAAAAAEAAAAAAAAABUFkbWluAAAAAAAAAg==",
  "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAEAAAAAAAAAEkF1dGhvcml6YXRpb25MZXZlbAAAAAAAAQAAABM=",
  "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAALc3VwZXJfYWRtaW4AAAAAEwAAAAA=",
  "AAAAAAAAAAAAAAASdXBkYXRlX3N1cGVyX2FkbWluAAAAAAABAAAAAAAAAA9uZXdfc3VwZXJfYWRtaW4AAAAAEwAAAAA=",
  "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
  "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
  "AAAAAAAAAAAAAAAEcm9sZQAAAAEAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAEAAAfQAAAABVJvbGVzAAAA",
  "AAAAAAAAAAAAAAAOaXNfc3VwZXJfYWRtaW4AAAAAAAEAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAEAAAAB",
  "AAAAAAAAAAAAAAALc3VwZXJfYWRtaW4AAAAAAAAAAAEAAAAT",
  "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAQAAAAAAAAAAAAAAClN1cGVyQWRtaW4AAA==",
]);

//
// This example demonstrates how to deploy a contract to the network
// using the ContractEngine and interact with it.
//
// This contract source code is currently available at:
//  https://github.com/CheesecakeLabs/soroban-dapps/tree/badges-contracts/governance-hub
//
export const governanceHubWithContractEngineDemo = async () => {
  //
  // Define the network configuration to use
  const networkConfig = TestNet();

  console.log("\nCreating and funding super admin account");
  // Create and a fund a new account
  // This account will be used to deploy the contract
  // and manage it as the super admin.
  const superAdmin = new DefaultAccountHandler({ networkConfig });
  await superAdmin.initializeWithFriendbot();
  console.log("Super admin account created: ", superAdmin.getPublicKey());

  //
  // Define the transaction invocation object that will be used
  // to deploy the contract and interact with it.
  const adminTxInvocation = {
    header: {
      source: superAdmin.getPublicKey(),
      fee: "10000000", //1XLM
      timeout: 45,
    },
    signers: [superAdmin],
  };

  //
  // Load the contract wasm file
  const contractWasmBuffer = await loadWasmFile(
    "./src/wasm-files/governance-hub/governance_hub.wasm"
  );

  //
  // Create a new instance of the ContractEngine
  // with the network configuration and the contract parameters
  //
  // This instance will be used to interact with the contract.
  const governanceHub = new ContractEngine({
    networkConfig,
    contractParameters: {
      spec: ghSpec,
      wasm: contractWasmBuffer,
    },
  });

  console.log("\nUploading wasm to the network...");
  //
  // Upload the wasm file to the network
  // This will return the wasm hash that can be used to deploy new instances of the contract
  await governanceHub.uploadWasm(adminTxInvocation);
  console.log(
    "Wasm uploaded successfully! Wasm hash: ",
    governanceHub.getWasmHash()
  );

  console.log("\nDeploying contract to the network...");
  //
  // Deploy the contract to the network.
  // This will return the contract address that can be used to interact with it.
  await governanceHub.deploy(adminTxInvocation);
  console.log(
    "Contract deployed successfully! Contract address: ",
    governanceHub.getContractId()
  );

  console.log("\nInvoking contract to Initialize...");
  await governanceHub.invokeContract({
    method: "initialize",
    methodArgs: {
      super_admin: superAdmin.getPublicKey(),
    },
    ...adminTxInvocation,
  });
  console.log("Contract initialized successfully!");
  console.log(
    "Super admin: ",
    await governanceHub.readFromContract({
      method: "super_admin",
      methodArgs: {},
      ...adminTxInvocation,
    })
  );

  // Instantiating a new account just to exemplify
  // admins being added to the governance hub
  const adminA = new DefaultAccountHandler({ networkConfig });

  console.log("\nInvoking contract to add Admin A as an admin...");
  await governanceHub.invokeContract({
    method: "add_admin",
    methodArgs: {
      admin: adminA.getPublicKey(),
    },
    ...adminTxInvocation,
  });
  console.log("Admin A added successfully!");

  console.log(
    `\nWhat is the role of admin A? \n  -NotAuthorized = 0 \n  -SuperAdmin = 1 \n  -Admin = 2 \nAdmin A has the role: "`,
    await governanceHub.readFromContract({
      method: "role",
      methodArgs: {
        address: adminA.getPublicKey(),
      },
      ...adminTxInvocation,
    })
  );

  console.log(
    "\nIs admin A a super admin?: ",
    await governanceHub.readFromContract({
      method: "is_super_admin",
      methodArgs: {
        address: adminA.getPublicKey(),
      },
      ...adminTxInvocation,
    })
  );

  console.log("\nInvoking contract to revoke Admin A role as an admin...");
  await governanceHub.invokeContract({
    method: "remove_admin",
    methodArgs: {
      admin: adminA.getPublicKey(),
    },
    ...adminTxInvocation,
  });

  console.log(
    `\nWhat is the role of admin A? \n  -NotAuthorized = 0 \n  -SuperAdmin = 1 \n  -Admin = 2 \nAdmin A has the role: "`,
    await governanceHub.readFromContract({
      method: "role",
      methodArgs: {
        address: adminA.getPublicKey(),
      },
      ...adminTxInvocation,
    })
  );
};
