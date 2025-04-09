export interface Job {
  name: string;
  instance: string;
  method: string;
  schedule?: string;
  config_path?: string;
  path: string;
  group: string;
}
