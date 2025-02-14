export interface Module {
  name: string;
  version?: string;
  sequence: string[];
  path: string;
  location: 'vendor' | 'app';
}
