import { ActionHash, AgentPubKey, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { localized, msg } from "@lit/localize";
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";
import { hashProperty, hashState, notifyError, onSubmit, sharedStyles, wrapPathInSvg } from "@tnesh-stack/elements";
import { SignalWatcher, toPromise } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";

import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";
import { fixieStoreContext } from "../context.js";
import { FixieStore } from "../fixie-store.js";
import { Issue, IssueStatus } from "../types.js";

/**
 * @element edit-issue
 * @fires issue-updated: detail will contain { originalIssueHash, previousIssueHash, updatedIssueHash }
 */
@localized()
@customElement("edit-issue")
export class EditIssue extends SignalWatcher(LitElement) {
  /**
   * REQUIRED. The hash of the original `Create` action for this Issue
   */
  @property(hashProperty("issue-hash"))
  issueHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: fixieStoreContext })
  fixieStore!: FixieStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  async firstUpdated() {
    const currentRecord = await toPromise(this.fixieStore.issues.get(this.issueHash).latestVersion);
    setTimeout(() => {
      (this.shadowRoot?.getElementById("form") as HTMLFormElement).reset();
    });
  }

  async updateIssue(currentRecord: EntryRecord<Issue>, fields: Partial<Issue>) {
    const issue: Issue = {
      title: fields.title!,
      description: fields.description!,
      issue_status: fields.issue_status!,
    };

    try {
      this.committing = true;
      const updateRecord = await this.fixieStore.client.updateIssue(
        this.issueHash,
        currentRecord.actionHash,
        issue,
      );

      this.dispatchEvent(
        new CustomEvent("issue-updated", {
          composed: true,
          bubbles: true,
          detail: {
            originalIssueHash: this.issueHash,
            previousIssueHash: currentRecord.actionHash,
            updatedIssueHash: updateRecord.actionHash,
          },
        }),
      );
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error updating the issue"));
    }

    this.committing = false;
  }

  renderEditForm(currentRecord: EntryRecord<Issue>) {
    return html`
      <sl-card>

        <form
          id="form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.updateIssue(currentRecord, fields))}
        >  
        <span class="title">${msg("Edit Issue")}</span>

        <sl-input name="title" .label=${msg("Title")}  required .defaultValue=${currentRecord.entry.title}></sl-input>
        <sl-textarea name="description" .label=${
      msg("Description")
    }  required .defaultValue=${currentRecord.entry.description}></sl-textarea>
        <sl-select name="issue_status" .label=${
      msg("Issue Status")
    } required .defaultValue=${currentRecord.entry.issue_status}>
  <sl-option value="Open">${msg("Open")}</sl-option>
  <sl-option value="Fixed">${msg("Fixed")}</sl-option>
  <sl-option value="Closed">${msg("Closed")}</sl-option>
</sl-select>

          <sl-button
            type="submit"
            variant="primary"
            style="flex: 1;"
            .loading=${this.committing}
          >${msg("Save")}</sl-button>
        </form>
      </sl-card>`;
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
        return this.renderEditForm(issue.value);
    }
  }

  static styles = [sharedStyles];
}
