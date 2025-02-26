import { css, html, LitElement } from 'lit';
import { provide, consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { AppClient } from '@holochain/client';
import { appClientContext } from '@tnesh-stack/elements';

import { fixieStoreContext } from '../context.js';
import { FixieStore } from '../fixie-store.js';
import { FixieClient } from '../fixie-client.js';

/**
 * @element fixie-context
 */
@customElement('fixie-context')
export class FixieContext extends LitElement {
  @consume({ context: appClientContext })
  private client!: AppClient;

  @provide({ context: fixieStoreContext })
  @property({ type: Object })
  store!: FixieStore;

  @property()
  role!: string;

  @property()
  zome = 'fixie';

  connectedCallback() {
    super.connectedCallback();
    if (this.store) return;
    if (!this.role) {
      throw new Error(`<fixie-context> must have a role="YOUR_DNA_ROLE" property, eg: <fixie-context role="role1">`);
    }
    if (!this.client) {
      throw new Error(`<fixie-context> must either:
        a) be placed inside <app-client-context>
          or 
        b) receive an AppClient property (eg. <fixie-context .client=\${client}>) 
          or 
        c) receive a store property (eg. <fixie-context .store=\${store}>)
      `);
    }

    this.store = new FixieStore(new FixieClient(this.client, this.role, this.zome));
  }
  
  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: contents;
    }
  `;
}

