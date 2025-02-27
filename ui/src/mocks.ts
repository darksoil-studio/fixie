import { Issue } from "./types.js";

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

  async get_untriaged_bug_reports(): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.bugReports.values()).map(r => r.revisions[r.revisions.length - 1]);
    const base = await fakeEntryHash();
    return Promise.all(records.map(async record => ({
      base,
      target: record.signed_action.hashed.hash,
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash(),
    })));
  }
  /** Issue */
  issues = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();

  async create_issue(issue: Issue): Promise<Record> {
    const entryHash = hash(issue, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(issue));

    this.issues.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record],
    });

    return record;
  }

  async get_latest_issue(issueHash: ActionHash): Promise<Record | undefined> {
    const issue = this.issues.get(issueHash);
    return issue ? issue.revisions[issue.revisions.length - 1] : undefined;
  }

  async get_all_revisions_for_issue(issueHash: ActionHash): Promise<Record[] | undefined> {
    const issue = this.issues.get(issueHash);
    return issue ? issue.revisions : undefined;
  }

  async get_original_issue(issueHash: ActionHash): Promise<Record | undefined> {
    const issue = this.issues.get(issueHash);
    return issue ? issue.revisions[0] : undefined;
  }

  async update_issue(
    input: { original_issue_hash: ActionHash; previous_issue_hash: ActionHash; updated_issue: Issue },
  ): Promise<Record> {
    const record = await fakeRecord(
      await fakeUpdateEntry(input.previous_issue_hash, undefined, undefined, fakeEntry(input.updated_issue)),
      fakeEntry(input.updated_issue),
    );

    this.issues.get(input.original_issue_hash).revisions.push(record);

    const issue = input.updated_issue;

    return record;
  }

  async get_open_issues(): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.issues.values()).map(r => r.revisions[r.revisions.length - 1]);
    const base = await fakeEntryHash();
    return Promise.all(records.map(async record => ({
      base,
      target: record.signed_action.hashed.hash,
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash(),
    })));
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

export async function sampleIssue(client: FixieClient, partialIssue: Partial<Issue> = {}): Promise<Issue> {
  return {
    ...{
      title: "Lorem ipsum 2",
      description: "Lorem ipsum 2",
      issue_status: { type: "Open" },
    },
    ...partialIssue,
  };
}
