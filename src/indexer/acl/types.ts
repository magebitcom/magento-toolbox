export interface Acl {
  id: string;
  path: string;
  title: string;
  description?: string;
  sortOrder?: number;
  disabled?: boolean;
  parent?: string;
}
