import { Memoize } from 'typescript-memoize';
import { Acl } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import AclIndexer from './AclIndexer';

export class AclIndexData extends AbstractIndexData<Acl[]> {
  @Memoize({
    tags: [AclIndexer.KEY],
  })
  public getAcls(): Acl[] {
    return Array.from(this.data.values()).flat();
  }

  public getAcl(aclId: string): Acl | undefined {
    return this.getAcls().find(acl => acl.id === aclId);
  }

  public getAclsByPrefix(prefix: string): Acl[] {
    return this.getAcls().filter(acl => acl.id.startsWith(prefix));
  }
}
