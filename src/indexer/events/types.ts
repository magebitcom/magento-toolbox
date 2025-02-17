export interface Event {
  name: string;
  observers: Observer[];
}

export interface Observer {
  name: string;
  instance: string;
}
