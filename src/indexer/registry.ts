import aclDefinition from './acl';
import autoloadNamespaceDefinition from './autoload-namespace';
import cronDefinition from './cron';
import diDefinition from './di';
import eventsDefinition from './events';
import layoutDefinition from './layout';
import moduleDefinition from './module';
import pageLayoutDefinition from './page-layout';
import templateDefinition from './template';
import themeDefinition from './theme';

export const indexerDefinitions = [
  aclDefinition,
  autoloadNamespaceDefinition,
  cronDefinition,
  diDefinition,
  eventsDefinition,
  layoutDefinition,
  moduleDefinition,
  pageLayoutDefinition,
  templateDefinition,
  themeDefinition,
] as const;

export type IndexerDefinitions = typeof indexerDefinitions;

export type IndexerDataMap = {
  [D in IndexerDefinitions[number] as D['key']]: ReturnType<D['createData']>;
};
