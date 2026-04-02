import { Memoize } from 'typescript-memoize';
import { Theme } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import ThemeIndexer from './ThemeIndexer';

export class ThemeIndexData extends AbstractIndexData<Theme> {
  @Memoize({ tags: [ThemeIndexer.KEY] })
  public getThemes(): Theme[] {
    return this.getValues().flat();
  }

  public getThemeByFilePath(path: string): Theme | undefined {
    const normalized = path.replace(/\\/g, '/');

    return this.getThemes().find(theme => {
      const base = theme.basePath.replace(/\\/g, '/');
      return normalized.startsWith(base);
    });
  }

  public getThemeById(id: string): Theme | undefined {
    return this.getThemes().find(theme => theme.id.toLowerCase() === id.toLowerCase());
  }
}
