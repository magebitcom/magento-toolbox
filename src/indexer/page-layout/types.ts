import {
  Block,
  BlockReference,
  Container,
  ContainerReference,
  Move,
  UiComponent,
} from 'indexer/layout/types';
import { MagentoScope } from 'types/global';

export interface PageLayout {
  path: string;
  area: MagentoScope;
  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
  referenceContainer: ContainerReference[];
  move: Move[];
}
