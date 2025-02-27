import { Issue } from "./types.js";

import { BugReport } from "./types.js";

import { ActionHash, AgentPubKey, EntryHash, NewEntryAction, Record } from "@holochain/client";
import {
  allRevisionsOfEntrySignal,
  AsyncComputed,
  collectionSignal,
  deletedLinksSignal,
  deletesForEntrySignal,
  immutableEntrySignal,
  latestVersionOfEntrySignal,
  liveLinksSignal,
  pipe,
} from "@tnesh-stack/signals";
import { EntryRecord, HashType, MemoHoloHashMap, retype, slice } from "@tnesh-stack/utils";

import { FixieClient } from "./fixie-client.js";

export class FixieStore {
  constructor(public client: FixieClient) {}

  /** Bug Report */

  bugReports = new MemoHoloHashMap((bugReportHash: ActionHash) => ({
    entry: immutableEntrySignal(() => this.client.getBugReport(bugReportHash)),
  }));

  /** Untriaged Bug Reports */

  untriagedBugReports = pipe(
    collectionSignal(
      this.client,
      () => this.client.getUntriagedBugReports(),
      "UntriagedBugReports",
    ),
    untriagedBugReports => slice(this.bugReports, untriagedBugReports.map(l => l.target)),
  );
  /** Issue */

  issues = new MemoHoloHashMap((issueHash: ActionHash) => ({
    latestVersion: latestVersionOfEntrySignal(this.client, () => this.client.getLatestIssue(issueHash)),
    original: immutableEntrySignal(() => this.client.getOriginalIssue(issueHash)),
    allRevisions: allRevisionsOfEntrySignal(this.client, () => this.client.getAllRevisionsForIssue(issueHash)),
  }));
}
