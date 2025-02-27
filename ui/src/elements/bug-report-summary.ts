import { ActionHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { hashProperty, sharedStyles } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { localized, msg } from "@lit/localize";

import "@tnesh-stack/elements/dist/elements/display-error.js";

import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { BugReport } from "../types.js";

/**
 * @element bug-report-summary
 * @fires bug-report-selected: detail will contain { bugReportHash }
 */
@localized()
@customElement("bug-report-summary")
export class BugReportSummary extends SignalWatcher(LitElement) {
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

  renderSummary(entryRecord: EntryRecord<BugReport>) {
    return html`
      <div class="column" style="gap: 16px; flex: 1;">

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Error")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.error}</span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Stack Trace")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.stack_trace}</span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Logs")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.logs}</span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Happ Version")}</strong></span>
 	        <span style="white-space: pre-line">${entryRecord.entry.happ_version}</span>
	  </div>

      </div>
    `;
  }

  renderBugReport() {
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
        return this.renderSummary(bugReport.value);
    }
  }

  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() =>
      this.dispatchEvent(
        new CustomEvent("bug-report-selected", {
          composed: true,
          bubbles: true,
          detail: {
            bugReportHash: this.bugReportHash,
          },
        }),
      )}>
      ${this.renderBugReport()}
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
