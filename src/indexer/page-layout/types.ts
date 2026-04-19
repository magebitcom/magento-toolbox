import {
  Block,
  BlockReference,
  Container,
  ContainerReference,
  Move,
  UiComponent,
} from 'indexer/layout/types';

export interface PageLayout {
  path: string;
  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
  referenceContainer: ContainerReference[];
  move: Move[];
}
