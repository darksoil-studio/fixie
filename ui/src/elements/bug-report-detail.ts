import { ActionHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { localized, msg } from "@lit/localize";
import { mdiAlertCircleOutline, mdiDelete, mdiPencil } from "@mdi/js";
import { hashProperty, notifyError, sharedStyles, wrapPathInSvg } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@tnesh-stack/elements/dist/elements/display-error.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { BugReport } from "../types.js";

/**
 * @element bug-report-detail
 * @fires edit-clicked: fired when the user clicks the edit icon button
 * @fires bug-report-deleted: detail will contain { bugReportHash }
 */
@localized()
@customElement("bug-report-detail")
export class BugReportDetail extends SignalWatcher(LitElement) {
  /**
   * REQUIRED. The hash of the BugReport to show
   */
  @property(hashProperty("bug-report-hash"))
  bugReportHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: fixieStoreContext, subscribe: true })
  fixieStore!: FixieStore;

  renderDetail(entryRecord: EntryRecord<BugReport>) {
    return html`
      <sl-card style="flex: 1">
        <div class="column" style="gap: 16px; flex: 1;">
          <div class="row" style="gap: 8px">
            <span style="font-size: 18px; flex: 1;">${msg("Bug Report")}</span>

          </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Error")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.error}</span>
	  </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Stack Trace")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.stack_trace}</span>
	  </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Logs")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.logs}</span>
	  </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Happ Version")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.happ_version}</span>
	  </div>

      </div>
      </sl-card>
    `;
  }

  render() {
    const bugReport = this.fixieStore.bugReports.get(this.bugReportHash).entry.get();

    switch (bugReport.status) {
      case "pending":
        return html`<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case "error":
        return html`<display-error
          .headline=${msg("Error fetching the bug report")}
          .error=${bugReport.error}
        ></display-error>`;
      case "completed":
        return this.renderDetail(bugReport.value);
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
