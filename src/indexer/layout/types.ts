interface Block {
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

interface BlockReference extends Block {
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

interface Container {
  name: string;
  after?: string;
  before?: string;

  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
}

interface ContainerReference {
  name: string;
  remove?: boolean;
  display?: boolean;

  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
}

interface UiComponent {
  name?: string;
  component?: string;
  as?: string;
  ttl?: number;
  group?: string;
  acl?: string;
  cacheable?: boolean;
}

interface Update {
  handle: string;
}

interface Remove {
  name: string;
}

interface Move {
  element: string;
  destination: string;
  as?: string;
  after?: string;
  before?: string;
}

interface Body {
  block: Block[];
  referenceBlock: BlockReference[];
  uiComponent: UiComponent[];
  container: Container[];
  move: Move[];
}

interface Page {
  update: Update[];
  body: Body[];
}

export interface Layout {
  area: string;
  theme: string;
  path: string;
  page: Page;
}
