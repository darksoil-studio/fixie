import { Issue } from "./types.js";

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

  /** Untriaged Bug Reports */

  async getUntriagedBugReports(): Promise<Array<Link>> {
    return this.callZome("get_untriaged_bug_reports", undefined);
  }
  /** Issue */

  async createIssue(issue: Issue): Promise<EntryRecord<Issue>> {
    const record: Record = await this.callZome("create_issue", issue);
    return new EntryRecord(record);
  }

  async getLatestIssue(issueHash: ActionHash): Promise<EntryRecord<Issue> | undefined> {
    const record: Record = await this.callZome("get_latest_issue", issueHash);
    return record ? new EntryRecord(record) : undefined;
  }

  async getOriginalIssue(issueHash: ActionHash): Promise<EntryRecord<Issue> | undefined> {
    const record: Record = await this.callZome("get_original_issue", issueHash);
    return record ? new EntryRecord(record) : undefined;
  }

  async getAllRevisionsForIssue(issueHash: ActionHash): Promise<Array<EntryRecord<Issue>>> {
    const records: Record[] = await this.callZome("get_all_revisions_for_issue", issueHash);
    return records.map(r => new EntryRecord(r));
  }

  async updateIssue(
    originalIssueHash: ActionHash,
    previousIssueHash: ActionHash,
    updatedIssue: Issue,
  ): Promise<EntryRecord<Issue>> {
    const record: Record = await this.callZome("update_issue", {
      original_issue_hash: originalIssueHash,
      previous_issue_hash: previousIssueHash,
      updated_issue: updatedIssue,
    });
    return new EntryRecord(record);
  }

  /** Open Issues */

  async getOpenIssues(): Promise<Array<Link>> {
    return this.callZome("get_open_issues", undefined);
  }
}
