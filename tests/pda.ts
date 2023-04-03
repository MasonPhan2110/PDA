import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { Pda } from "../target/types/pda";

describe("pda", () => {
  const provider = anchor.AnchorProvider.local();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Pda as Program<Pda>;
  let counterSeed = anchor.utils.bytes.utf8.encode("counter");
  let counterPubkey;

  before(async () => {
    [counterPubkey] = await anchor.web3.PublicKey.findProgramAddressSync(
      [counterSeed],
      program.programId
    );
  });

  it("Is run the constructor", async () => {
    await program.methods
    .initialize()
    .accounts({
      counter: counterPubkey,
      authority: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .rpc();

    // Fetch the state struct from the network.
    const counterAccount = await program.account.counter.fetch(counterPubkey);

    assert.ok(counterAccount.count.eq(new anchor.BN(0)));
  });
  it("Executes a method on the program", async () => {
    await program.methods.increment()
    .accounts({
      counter: counterPubkey,
      authority: provider.wallet.publicKey,
    })
    .rpc();

    const counterAccount = await program.account.counter.fetch(counterPubkey);
    assert.ok(counterAccount.count.eq(new anchor.BN(1)));
  });
});
