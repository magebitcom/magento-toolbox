export interface Event {
  name: string;
  observers: Observer[];
  diPath: string;
}

export interface Observer {
  name: string;
  instance: string;
}
