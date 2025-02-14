export interface DiData {
  types: DiType[];
  preferences: DiPreference[];
  virtualTypes: DiVirtualType[];
  plugins: DiPlugin[];
}

export interface DiPlugin {
  name: string;
  type: string;
  before?: string;
  after?: string;
  disabled?: boolean;
  sortOrder?: number;
  diPath: string;
}

export interface DiArguments {
  [key: string]: any;
}

export interface DiPreference {
  for: string;
  type: string;
  diPath: string;
}

export interface DiBaseType {
  name: string;
  shared?: boolean;
  arguments?: DiArguments;
  diPath: string;
}

export interface DiType extends DiBaseType {
  plugins: DiPlugin[];
}

export interface DiVirtualType extends DiBaseType {
  type: string;
}
