import { assert, test } from "vitest";

import { ActionHash, Delete, Record, SignedActionHashed } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { cleanNodeDecoding } from "@tnesh-stack/utils/dist/clean-node-decoding.js";

import { sampleIssue } from "../../ui/src/mocks.js";
import { Issue } from "../../ui/src/types.js";
import { setup } from "./setup.js";

test("create Issue", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Alice creates a Issue
    const issue: EntryRecord<Issue> = await alice.store.client.createIssue(await sampleIssue(alice.store.client));
    assert.ok(issue);
  });
});

test("create and read Issue", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    const sample = await sampleIssue(alice.store.client);

    // Alice creates a Issue
    const issue: EntryRecord<Issue> = await alice.store.client.createIssue(sample);
    assert.ok(issue);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the created Issue
    const createReadOutput: EntryRecord<Issue> = await toPromise(bob.store.issues.get(issue.actionHash).original);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});

test("create and update Issue", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Alice creates a Issue
    const issue: EntryRecord<Issue> = await alice.store.client.createIssue(await sampleIssue(alice.store.client));
    assert.ok(issue);

    const originalActionHash = issue.actionHash;

    // Alice updates the Issue
    let contentUpdate = await sampleIssue(alice.store.client);

    let updatedIssue: EntryRecord<Issue> = await alice.store.client.updateIssue(
      originalActionHash,
      originalActionHash,
      contentUpdate,
    );
    assert.ok(updatedIssue);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the updated Issue
    const readUpdatedOutput0: EntryRecord<Issue> = await toPromise(
      bob.store.issues.get(issue.actionHash).latestVersion,
    );
    assert.deepEqual(contentUpdate, cleanNodeDecoding(readUpdatedOutput0.entry));

    // Alice updates the Issue again
    contentUpdate = await sampleIssue(alice.store.client);

    updatedIssue = await alice.store.client.updateIssue(originalActionHash, updatedIssue.actionHash, contentUpdate);
    assert.ok(updatedIssue);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the updated Issue
    const readUpdatedOutput1: EntryRecord<Issue> = await toPromise(
      bob.store.issues.get(originalActionHash).latestVersion,
    );
    assert.deepEqual(contentUpdate, cleanNodeDecoding(readUpdatedOutput1.entry));
  });
});
