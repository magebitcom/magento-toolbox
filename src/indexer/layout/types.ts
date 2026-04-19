export type WithLayout<T> = {
  layout: Layout;
  element: T;
};

export interface Block {
  name?: string;
  class?: string;
  cacheable?: boolean;
  as?: string;
  ttl?: number;
  group?: string;
  acl?: string;

  block: Block[];
  container: Container[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
}

export interface BlockReference extends Block {
  name: string;
  template?: string;
  class?: string;
  group?: string;
  display?: boolean;
  remove?: boolean;

  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
}

export interface Container {
  name: string;
  after?: string;
  before?: string;

  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
  referenceContainer: ContainerReference[];
}

export interface ContainerReference {
  name: string;
  remove?: boolean;
  display?: boolean;

  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
  referenceContainer: ContainerReference[];
}

export interface UiComponent {
  name?: string;
  component?: string;
  as?: string;
  ttl?: number;
  group?: string;
  acl?: string;
  cacheable?: boolean;
}

export interface Update {
  handle: string;
}

export interface Remove {
  name: string;
}

export interface Move {
  element: string;
  destination: string;
  as?: string;
  after?: string;
  before?: string;
}

export interface Body {
  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
  referenceContainer: ContainerReference[];
  move: Move[];
}

export interface Page {
  update: Update[];
  body: Body[];
}

export interface Layout {
  area: string;
  theme: string;
  path: string;
  page: Page;
}
