import { BugReport } from "./types.js";

import {
  ActionHash,
  AgentPubKey,
  AppClient,
  decodeHashFromBase64,
  Delete,
  EntryHash,
  fakeActionHash,
  fakeAgentPubKey,
  fakeDnaHash,
  fakeEntryHash,
  Link,
  NewEntryAction,
  Record,
  SignedActionHashed,
} from "@holochain/client";
import {
  AgentPubKeyMap,
  decodeEntry,
  fakeCreateAction,
  fakeDeleteEntry,
  fakeEntry,
  fakeRecord,
  fakeUpdateEntry,
  hash,
  HashType,
  HoloHashMap,
  pickBy,
  ZomeMock,
} from "@tnesh-stack/utils";
import { FixieClient } from "./fixie-client.js";

export class FixieZomeMock extends ZomeMock implements AppClient {
  constructor(
    myPubKey?: AgentPubKey,
  ) {
    super("fixie_test", "fixie", "fixie_test_app", myPubKey);
  }
  /** Bug Report */
  bugReports = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();

  async create_bug_report(bugReport: BugReport): Promise<Record> {
    const entryHash = hash(bugReport, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(bugReport));

    this.bugReports.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record],
    });

    return record;
  }

  async get_bug_report(bugReportHash: ActionHash): Promise<Record | undefined> {
    const bugReport = this.bugReports.get(bugReportHash);
    return bugReport ? bugReport.revisions[0] : undefined;
  }
}

export async function sampleBugReport(
  client: FixieClient,
  partialBugReport: Partial<BugReport> = {},
): Promise<BugReport> {
  return {
    ...{
      error: "Lorem ipsum 2",
      stack_trace: "Lorem ipsum 2",
      logs: "Lorem ipsum 2",
      state_dump: "Lorem ipsum 2",
      happ_specific_data: "Lorem ipsum 2",
      happ_version: "Lorem ipsum 2",
    },
    ...partialBugReport,
  };
}
