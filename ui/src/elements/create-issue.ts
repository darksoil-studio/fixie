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

import "@shoelace-style/shoelace/dist/components/icon/icon.js";

import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea.js";
import "@tnesh-stack/elements/dist/elements/display-error.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { Issue, IssueStatus } from "../types.js";

/**
 * @element create-issue
 * @fires issue-created: detail will contain { issueHash }
 */
@localized()
@customElement("create-issue")
export class CreateIssue extends SignalWatcher(LitElement) {
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

  async createIssue(fields: Partial<Issue>) {
    const issue: Issue = {
      title: fields.title!,
      description: fields.description!,
      issue_status: fields.issue_status!,
    };

    try {
      this.committing = true;
      const record: EntryRecord<Issue> = await this.fixieStore.client.createIssue(issue);

      this.dispatchEvent(
        new CustomEvent("issue-created", {
          composed: true,
          bubbles: true,
          detail: {
            issueHash: record.actionHash,
          },
        }),
      );

      this.form.reset();
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error creating the issue"));
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
          ${onSubmit(fields => this.createIssue(fields))}
        >  
          <span class="title">${msg("Create Issue")}</span>

          <sl-input name="title" .label=${msg("Title")}  required></sl-input>
          <sl-textarea name="description" .label=${msg("Description")}  required></sl-textarea>
          <sl-select name="issue_status" .label=${msg("Issue Status")} required >
  <sl-option value="Open">${msg("Open")}</sl-option>
  <sl-option value="Fixed">${msg("Fixed")}</sl-option>
  <sl-option value="Closed">${msg("Closed")}</sl-option>
</sl-select>

          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Issue")}</sl-button>
        </form> 
      </sl-card>`;
  }

  static styles = [sharedStyles];
}
