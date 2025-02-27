import { BugReport } from "./types.js";

import {
  ActionHash,
  AgentPubKey,
  AppClient,
  CreateLink,
  Delete,
  DeleteLink,
  EntryHash,
  Link,
  Record,
  SignedActionHashed,
} from "@holochain/client";
import { EntryRecord, ZomeClient } from "@tnesh-stack/utils";

import { FixieSignal } from "./types.js";

export class FixieClient extends ZomeClient<FixieSignal> {
  constructor(public client: AppClient, public roleName: string, public zomeName = "fixie") {
    super(client, roleName, zomeName);
  }
  /** Bug Report */

  async createBugReport(bugReport: BugReport): Promise<EntryRecord<BugReport>> {
    const record: Record = await this.callZome("create_bug_report", bugReport);
    return new EntryRecord(record);
  }

  async getBugReport(bugReportHash: ActionHash): Promise<EntryRecord<BugReport> | undefined> {
    const record: Record = await this.callZome("get_bug_report", bugReportHash);
    return record ? new EntryRecord(record) : undefined;
  }
}
