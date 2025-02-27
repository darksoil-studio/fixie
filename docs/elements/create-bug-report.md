# `<create-bug-report>`

## Usage

0. If you haven't already, [go through the setup for the module](/setup).

1. Import the `<create-bug-report>` element somewhere in the javascript side of your web-app like this:

```js
import '@darksoil-studio/fixie/dist/elements/create-bug-report.js'
```

2. Use it in the html side of your web-app like this:


::: code-group
```html [Lit]
<create-bug-report 
  .stateDump=${ stateDump }
  .happSpecificData=${ happSpecificData }
>
</create-bug-report>
```

```html [React]
<create-bug-report
  stateDump={ stateDump }
  happSpecificData={ happSpecificData }
>
</create-bug-report>
```

```html [Angular]
<create-bug-report
  [stateDump]="stateDump"
  [happSpecificData]="happSpecificData"
>
</create-bug-report>
```

```html [Vue]
<create-bug-report
  :stateDump="stateDump"
  :happSpecificData="happSpecificData"
>
</create-bug-report>
```

```html [Svelte]
<create-bug-report
  state-dump={encodeHashToBase64(stateDump)}
  happ-specific-data={encodeHashToBase64(happSpecificData)}
>
</create-bug-report>
```
:::

> [!WARNING]
> Like all the elements in this module, `<create-bug-report>` needs to be placed inside an initialized `<fixie-context>`.

## Demo

Here is an interactive demo of the element:

<element-demo>
</element-demo>

<script setup>
import { onMounted } from "vue";
import { ProfilesClient, ProfilesStore } from '@darksoil-studio/profiles-zome';
import { demoProfiles, ProfilesZomeMock } from '@darksoil-studio/profiles-zome/dist/mocks.js';
import { decodeHashFromBase64 } from '@holochain/client';
import { render, html } from "lit";

import { FixieZomeMock, sampleBugReport } from "../../ui/src/mocks.ts";
import { FixieStore } from "../../ui/src/fixie-store.ts";
import { FixieClient } from "../../ui/src/fixie-client.ts";

onMounted(async () => {
  // Elements need to be imported on the client side, not the SSR side
  // Reference: https://vitepress.dev/guide/ssr-compat#importing-in-mounted-hook
  await import('@api-viewer/docs/lib/api-docs.js');
  await import('@api-viewer/demo/lib/api-demo.js');
  await import('@darksoil-studio/profiles-zome/dist/elements/profiles-context.js');
  if (!customElements.get('fixie-context')) await import('../../ui/src/elements/fixie-context.ts');
  if (!customElements.get('create-bug-report')) await import('../../ui/src/elements/create-bug-report.ts');

  const profiles = await demoProfiles();

  const profilesMock = new ProfilesZomeMock(
    profiles,
    Array.from(profiles.keys())[0]
  );
  const profilesStore = new ProfilesStore(new ProfilesClient(profilesMock, "fixie_test"));

  const mock = new FixieZomeMock();
  const client = new FixieClient(mock, "fixie_test");

  const bugReport = await sampleBugReport(client);

  const record = await mock.create_bug_report(bugReport);

  const store = new FixieStore(client);
  
  render(html`
    <profiles-context .store=${profilesStore}>
      <fixie-context .store=${store}>
        <api-demo src="custom-elements.json" only="create-bug-report" exclude-knobs="store">
        </api-demo>
      </fixie-context>
    </profiles-context>
  `, document.querySelector('element-demo'))
  })


</script>

## API Reference

`<create-bug-report>` is a [custom element](https://web.dev/articles/custom-elements-v1), which means that it can be used in any web app or website. Here is the reference for its API:

<api-docs src="custom-elements.json" only="create-bug-report">
</api-docs>
