# `<bug-report-detail>`

## Usage

0. If you haven't already, [go through the setup for the module](/setup).

1. Import the `<bug-report-detail>` element somewhere in the javascript side of your web-app like this:

```js
import '@darksoil-studio/fixie/dist/elements/bug-report-detail.js'
```

2. Use it in the html side of your web-app like this:

::: code-group
```html [Lit]
<bug-report-detail .bugReportHash=${ bugReportHash }>
</bug-report-detail>
```

```html [React]
<bug-report-detail bugReportHash={ bugReportHash }>
</bug-report-detail>
```

```html [Angular]
<bug-report-detail [bugReportHash]="bugReportHash">
</bug-report-detail>
```

```html [Vue]
<bug-report-detail :bugReportHash="bugReportHash">
</bug-report-detail>
```

```html [Svelte]
<bug-report-detail bug-report-hash={encodeHashToBase64(bugReportHash)}>
</bug-report-detail>
```
:::


> [!WARNING]
> Like all the elements in this module, `<bug-report-detail>` needs to be placed inside an initialized `<fixie-context>`.

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
  if (!customElements.get('bug-report-detail')) await import('../../ui/src/elements/bug-report-detail.ts');

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
        <api-demo src="custom-elements.json" only="bug-report-detail" exclude-knobs="store">
          <template data-element="bug-report-detail" data-target="host">
            <bug-report-detail bug-report-hash="${unsafeStatic(encodeHashToBase64(record.signed_action.hashed.hash))}"></bug-report-detail>
          </template>
        </api-demo>
      </fixie-context>
    </profiles-context>
  `, document.querySelector('element-demo'))
  })


</script>

## API Reference

`<bug-report-detail>` is a [custom element](https://web.dev/articles/custom-elements-v1), which means that it can be used in any web app or website. Here is the reference for its API:

<api-docs src="custom-elements.json" only="bug-report-detail">
</api-docs>
