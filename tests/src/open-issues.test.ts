import { assert, test } from "vitest";

import { ActionHash, EntryHash, Record } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";

import { sampleIssue } from "../../ui/src/mocks.js";
import { Issue } from "../../ui/src/types.js";
import { setup } from "./setup.js";

test("create a Issue and get open issues", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Bob gets open issues
    let collectionOutput = await toPromise(bob.store.openIssues);
    assert.equal(collectionOutput.size, 0);

    // Alice creates a Issue
    const issue: EntryRecord<Issue> = await alice.store.client.createIssue(await sampleIssue(alice.store.client));
    assert.ok(issue);

    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets open issues again
    collectionOutput = await toPromise(bob.store.openIssues);
    assert.equal(collectionOutput.size, 1);
    assert.deepEqual(issue.actionHash, Array.from(collectionOutput.keys())[0]);
  });
});
