import { ActionHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { localized, msg } from "@lit/localize";
import { mdiAlertCircleOutline, mdiDelete, mdiPencil } from "@mdi/js";
import { hashProperty, notifyError, sharedStyles, wrapPathInSvg } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";

import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@tnesh-stack/elements/dist/elements/display-error.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { Issue, IssueStatus } from "../types.js";

/**
 * @element issue-detail
 * @fires edit-clicked: fired when the user clicks the edit icon button
 * @fires issue-deleted: detail will contain { issueHash }
 */
@localized()
@customElement("issue-detail")
export class IssueDetail extends SignalWatcher(LitElement) {
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

  renderDetail(entryRecord: EntryRecord<Issue>) {
    return html`
      <sl-card style="flex: 1">
        <div class="column" style="gap: 16px; flex: 1;">
          <div class="row" style="gap: 8px">
            <span style="font-size: 18px; flex: 1;">${msg("Issue")}</span>

            <sl-icon-button .src=${wrapPathInSvg(mdiPencil)} @click=${() =>
      this.dispatchEvent(
        new CustomEvent("edit-clicked", {
          bubbles: true,
          composed: true,
        }),
      )}></sl-icon-button>
          </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Title")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.title}</span>
	  </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Description")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.description}</span>
	  </div>

          <div class="column" style="gap: 8px;">
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
      </sl-card>
    `;
  }

  render() {
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
        return this.renderDetail(issue.value);
    }
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
