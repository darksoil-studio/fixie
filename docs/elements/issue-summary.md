# `<issue-summary>`

## Usage

0. If you haven't already, [go through the setup for the module](/setup).

1. Import the `<issue-summary>` element somewhere in the javascript side of your web-app like this:

```js
import '@darksoil-studio/fixie/dist/elements/issue-summary.js'
```

2. Use it in the html side of your web-app like this:

::: code-group
```html [Lit]
<issue-summary .issueHash=${ issueHash }>
</issue-summary>
```

```html [React]
<issue-summary issueHash={ issueHash }>
</issue-summary>
```

```html [Angular]
<issue-summary [issueHash]="issueHash">
</issue-summary>
```

```html [Vue]
<issue-summary :issueHash="issueHash">
</issue-summary>
```

```html [Svelte]
<issue-summary issue-hash={encodeHashToBase64(issueHash)}>
</issue-summary>
```
:::

> [!WARNING]
> Like all the elements in this module, `<issue-summary>` needs to be placed inside an initialized `<fixie-context>`.

## Demo

Here is an interactive demo of the element:

<element-demo>
</element-demo>

<script setup>
import { onMounted } from "vue";
import { ProfilesClient, ProfilesStore } from '@darksoil-studio/profiles-zome';
import { demoProfiles, ProfilesZomeMock } from '@darksoil-studio/profiles-zome/dist/mocks.js';
import { decodeHashFromBase64, encodeHashToBase64 } from '@holochain/client';
import { render } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";

import { FixieZomeMock, sampleIssue } from "../../ui/src/mocks.ts";
import { FixieStore } from "../../ui/src/fixie-store.ts";
import { FixieClient } from "../../ui/src/fixie-client.ts";

onMounted(async () => {
  // Elements need to be imported on the client side, not the SSR side
  // Reference: https://vitepress.dev/guide/ssr-compat#importing-in-mounted-hook
  await import('@api-viewer/docs/lib/api-docs.js');
  await import('@api-viewer/demo/lib/api-demo.js');
  await import('@darksoil-studio/profiles-zome/dist/elements/profiles-context.js');
  if (!customElements.get('fixie-context')) await import('../../ui/src/elements/fixie-context.ts');
  if (!customElements.get('issue-summary')) await import('../../ui/src/elements/issue-summary.ts');

  const profiles = await demoProfiles();

  const profilesMock = new ProfilesZomeMock(
    profiles,
    Array.from(profiles.keys())[0]
  );
  const profilesStore = new ProfilesStore(new ProfilesClient(profilesMock, "fixie_test"));

  const mock = new FixieZomeMock();
  const client = new FixieClient(mock, "fixie_test");

  const issue = await sampleIssue(client);

  const record = await mock.create_issue(issue);

  const store = new FixieStore(client);
  
  render(html`
    <profiles-context .store=${profilesStore}>
      <fixie-context .store=${store}>
        <api-demo src="custom-elements.json" only="issue-summary" exclude-knobs="store">
          <template data-element="issue-summary" data-target="host">
            <issue-summary issue-hash="${unsafeStatic(encodeHashToBase64(record.signed_action.hashed.hash))}"></issue-summary>
          </template>
        </api-demo>
      </fixie-context>
    </profiles-context>
  `, document.querySelector('element-demo'))
  })


</script>

## API Reference

`<issue-summary>` is a [custom element](https://web.dev/articles/custom-elements-v1), which means that it can be used in any web app or website. Here is the reference for its API:

<api-docs src="custom-elements.json" only="issue-summary">
</api-docs>
