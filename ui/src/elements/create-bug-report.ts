import { ActionHash, AgentPubKey, DnaHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { localized, msg } from "@lit/localize";
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";
import { hashProperty, hashState, notifyError, onSubmit, sharedStyles, wrapPathInSvg } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@tnesh-stack/elements/dist/elements/display-error.js";

import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { BugReport } from "../types.js";

/**
 * @element create-bug-report
 * @fires bug-report-created: detail will contain { bugReportHash }
 */
@localized()
@customElement("create-bug-report")
export class CreateBugReport extends SignalWatcher(LitElement) {
  /**
   * OPTIONAl. The state dump for this BugReport
   */
  @property()
  stateDump: string | undefined;

  /**
   * OPTIONAl. The happ specific data for this BugReport
   */
  @property()
  happSpecificData: string | undefined;

  /**
   * @internal
   */
  @consume({ context: fixieStoreContext, subscribe: true })
  fixieStore!: FixieStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  /**
   * @internal
   */
  @query("#create-form")
  form!: HTMLFormElement;

  async createBugReport(fields: Partial<BugReport>) {
    const bugReport: BugReport = {
      error: fields.error!,
      stack_trace: fields.stack_trace ? fields.stack_trace : undefined,
      logs: fields.logs ? fields.logs : undefined,
      state_dump: this.stateDump!,
      happ_specific_data: this.happSpecificData!,
      happ_version: fields.happ_version!,
    };

    try {
      this.committing = true;
      const record: EntryRecord<BugReport> = await this.fixieStore.client.createBugReport(bugReport);

      this.dispatchEvent(
        new CustomEvent("bug-report-created", {
          composed: true,
          bubbles: true,
          detail: {
            bugReportHash: record.actionHash,
          },
        }),
      );

      this.form.reset();
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error creating the bug report"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">

        <form 
          id="create-form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.createBugReport(fields))}
        >  
          <span class="title">${msg("Create Bug Report")}</span>

          <sl-textarea name="error" .label=${msg("Error")}  required></sl-textarea>
          <sl-textarea name="stack_trace" .label=${msg("Stack Trace")} ></sl-textarea>
          <sl-textarea name="logs" .label=${msg("Logs")} ></sl-textarea>
          <sl-input name="happ_version" .label=${msg("Happ Version")}  required></sl-input>

          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Bug Report")}</sl-button>
        </form> 
      </sl-card>`;
  }

  static styles = [sharedStyles];
}
