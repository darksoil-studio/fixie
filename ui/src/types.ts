import {
  ActionHash,
  AgentPubKey,
  Create,
  CreateLink,
  Delete,
  DeleteLink,
  DnaHash,
  EntryHash,
  Record,
  SignedActionHashed,
  Update,
} from "@holochain/client";
import { ActionCommittedSignal } from "@tnesh-stack/utils";

export type FixieSignal = ActionCommittedSignal<EntryTypes, LinkTypes>;

export type EntryTypes = ({ type: "Issue" } & Issue) | { type: "BugReport" } & BugReport;

export type LinkTypes = string;

export interface BugReport {
  error: string;

  stack_trace: string | undefined;

  logs: string | undefined;

  state_dump: string | undefined;

  happ_specific_data: string | undefined;

  happ_version: string;
}

export interface IssueStatus {
  type:
    | "Open"
    | "Fixed"
    | "Closed";
}

export interface Issue {
  title: string;

  description: string;

  issue_status: IssueStatus;
}
