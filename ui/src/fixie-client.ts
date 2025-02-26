import { 
  SignedActionHashed,
  CreateLink,
  Link,
  DeleteLink,
  Delete,
  AppClient, 
  Record, 
  ActionHash, 
  EntryHash, 
  AgentPubKey,
} from '@holochain/client';
import { EntryRecord, ZomeClient } from '@tnesh-stack/utils';

import { FixieSignal } from './types.js';

export class FixieClient extends ZomeClient<FixieSignal> {

  constructor(public client: AppClient, public roleName: string, public zomeName = 'fixie') {
    super(client, roleName, zomeName);
  }
}
