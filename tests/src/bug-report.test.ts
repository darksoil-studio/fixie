import { assert, test } from "vitest";

import { ActionHash, Delete, Record, SignedActionHashed } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { cleanNodeDecoding } from "@tnesh-stack/utils/dist/clean-node-decoding.js";

import { sampleBugReport } from "../../ui/src/mocks.js";
import { BugReport } from "../../ui/src/types.js";
import { setup } from "./setup.js";

test("create BugReport", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    // Alice creates a BugReport
    const bugReport: EntryRecord<BugReport> = await alice.store.client.createBugReport(
      await sampleBugReport(alice.store.client),
    );
    assert.ok(bugReport);
  });
});

test("create and read BugReport", async () => {
  await runScenario(async scenario => {
    const [alice, bob] = await setup(scenario);

    const sample = await sampleBugReport(alice.store.client);

    // Alice creates a BugReport
    const bugReport: EntryRecord<BugReport> = await alice.store.client.createBugReport(sample);
    assert.ok(bugReport);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0],
    );

    // Bob gets the created BugReport
    const createReadOutput: EntryRecord<BugReport> = await toPromise(
      bob.store.bugReports.get(bugReport.actionHash).entry,
    );
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});
