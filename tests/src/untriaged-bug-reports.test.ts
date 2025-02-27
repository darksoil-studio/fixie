import { assert, test } from "vitest";

import { ActionHash, EntryHash, Record } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";

import { sampleBugReport } from "../../ui/src/mocks.js";
import { BugReport } from "../../ui/src/types.js";
import { setup } from "./setup.js";

test("create a BugReport and get untriaged bug reports", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Bob gets untriaged bug reports
    let collectionOutput = await toPromise(bob.store.untriagedBugReports);
    assert.equal(collectionOutput.size, 0);

    // Alice creates a BugReport
    const bugReport: EntryRecord<BugReport> = await alice.store.client.createBugReport(
      await sampleBugReport(alice.store.client),
    );
    assert.ok(bugReport);

    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets untriaged bug reports again
    collectionOutput = await toPromise(bob.store.untriagedBugReports);
    assert.equal(collectionOutput.size, 1);
    assert.deepEqual(bugReport.actionHash, Array.from(collectionOutput.keys())[0]);
  });
});
