import { ActionHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { hashProperty, sharedStyles } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { localized, msg } from "@lit/localize";

import "@tnesh-stack/elements/dist/elements/display-error.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";

import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { Issue, IssueStatus } from "../types.js";

/**
 * @element issue-summary
 * @fires issue-selected: detail will contain { issueHash }
 */
@localized()
@customElement("issue-summary")
export class IssueSummary extends SignalWatcher(LitElement) {
  /**
   * REQUIRED. The hash of the Issue to show
   */
  @property(hashProperty("issue-hash"))
  issueHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: fixieStoreContext, subscribe: true })
  fixieStore!: FixieStore;

  renderSummary(entryRecord: EntryRecord<Issue>) {
    return html`
      <div class="column" style="gap: 16px; flex: 1;">

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Title")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.title}</span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Description")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.description}</span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Issue Status")}</strong></span>
 	        <span style="white-space: pre-line">${
      entryRecord.entry.issue_status.type === "Open"
        ? msg("Open")
        : entryRecord.entry.issue_status.type === "Fixed"
        ? msg("Fixed")
        : msg("Closed")
    }</span>
	  </div>

      </div>
    `;
  }

  renderIssue() {
    const issue = this.fixieStore.issues.get(this.issueHash).latestVersion.get();

    switch (issue.status) {
      case "pending":
        return html`<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case "error":
        return html`<display-error
          .headline=${msg("Error fetching the issue")}
          .error=${issue.error}
        ></display-error>`;
      case "completed":
        return this.renderSummary(issue.value);
    }
  }

  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() =>
      this.dispatchEvent(
        new CustomEvent("issue-selected", {
          composed: true,
          bubbles: true,
          detail: {
            issueHash: this.issueHash,
          },
        }),
      )}>
      ${this.renderIssue()}
    </sl-card>`;
  }

  static styles = [
    sharedStyles,
    css`
    :host {
      display: flex;
    }
  `,
  ];
}
