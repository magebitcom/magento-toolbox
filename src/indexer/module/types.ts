export interface Module {
  name: string;
  version?: string;
  sequence: string[];
  path: string;
  moduleXmlPath: string;
  location: 'vendor' | 'app';
}
