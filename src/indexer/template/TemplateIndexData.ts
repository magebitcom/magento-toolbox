import { Memoize } from 'typescript-memoize';
import { Template } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import TemplateIndexer from './TemplateIndexer';

export class TemplateIndexData extends AbstractIndexData<Template[]> {
  @Memoize({
    tags: [TemplateIndexer.KEY],
  })
  public getTemplates(): Template[] {
    return Array.from(this.data.values()).flat();
  }

  public getTemplate(magentoPath: string): Template | undefined {
    return this.getTemplates().find(template => template.magentoPath === magentoPath);
  }

  public getTemplatesByPrefix(prefix: string): Template[] {
    return this.getTemplates().filter(template => template.magentoPath.startsWith(prefix));
  }
}
